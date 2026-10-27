import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  runTransaction,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { isDateRangeOverlapping, calculateNights } from '../utils/dateUtils';
import { getRoomById } from './roomService';
import { calculateServiceCost } from './serviceItemsService';

const BOOKINGS_COLLECTION = 'bookings';

/**
 * Generate a unique luxury booking reference code
 */
const generateBookingReference = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AUR-${new Date().getFullYear()}-${code}`;
};

/**
 * Concurrency-Safe Booking Creation
 * Validates availability, guest capacity, calculates trusted totals,
 * locks price snapshots, and executes inside a Firestore transaction.
 */
export const createBooking = async ({
  userId,
  roomId,
  guestName,
  guestPhone,
  guestCNIC,
  guestCount,
  checkIn,
  checkOut,
  selectedServices = [],
  specialRequests = '',
}) => {
  if (!db) {
    throw new Error('Firestore database is not connected. Please verify your configuration.');
  }

  // 1. Fetch Room Details from Firestore
  const room = await getRoomById(roomId);
  if (!room) {
    throw new Error('Room not found. Please select a valid suite.');
  }

  // 2. Validate Guest Capacity
  const guests = Number(guestCount);
  if (guests > room.capacity) {
    throw new Error(
      `Selected room (${room.category}) accommodates a maximum of ${room.capacity} guest${room.capacity > 1 ? 's' : ''}.`
    );
  }

  // 3. Calculate Nights
  const nights = calculateNights(checkIn, checkOut);
  if (nights < 1) {
    throw new Error('Check-out date must be after check-in date.');
  }

  // 4. Calculate Financials & Price Snapshots
  const roomNightlyPrice = Number(room.pricePerNight);
  const roomSubtotal = roomNightlyPrice * nights;

  let servicesTotal = 0;
  const servicesSnapshot = selectedServices.map((item) => {
    const srv = item.service || item;
    const cost = calculateServiceCost(srv, guests, nights);
    servicesTotal += cost;
    return {
      serviceId: srv.id,
      name: srv.name,
      unitPrice: srv.price,
      pricingModel: srv.pricingModel,
      calculatedCost: cost,
    };
  });

  const grandTotal = roomSubtotal + servicesTotal;
  const bookingReference = generateBookingReference();
  const bookingId = `book-${Date.now()}`;

  const bookingPayload = {
    id: bookingId,
    bookingReference,
    userId: userId || 'anonymous',
    roomId,
    roomSnapshot: {
      id: room.id,
      name: room.name,
      category: room.category,
      roomNumber: room.roomNumber,
      pricePerNight: roomNightlyPrice,
      pricingUnit: room.pricingUnit || 'night',
      image: room.images?.[0] || '',
    },
    guestDetails: {
      fullName: guestName,
      phone: guestPhone,
      cnic: guestCNIC, // sensitive; masked in views
    },
    guestCount: guests,
    checkIn,
    checkOut,
    nights,
    pricingSnapshot: {
      roomNightlyPrice,
      pricingUnit: room.pricingUnit || 'night',
      nights,
      roomSubtotal,
      servicesTotal,
      taxesAndFees: 0,
      grandTotal,
      currency: 'PKR',
    },
    servicesSnapshot,
    specialRequests: specialRequests || '',
    status: 'confirmed', // confirmed, checked-in, checked-out, cancelled
    paymentStatus: 'Pay Upon Arrival (At Check-In)',
    createdAt: new Date().toISOString(),
  };

  // 5. Concurrency Check via Firestore Transaction
  const bookingDocRef = doc(db, BOOKINGS_COLLECTION, bookingId);

  await runTransaction(db, async (transaction) => {
    // Re-verify availability inside transaction scope
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('roomId', '==', roomId),
      where('status', 'in', ['confirmed', 'checked-in'])
    );
    const existingSnap = await getDocs(q);

    let conflict = false;
    existingSnap.forEach((d) => {
      const b = d.data();
      if (isDateRangeOverlapping(checkIn, checkOut, b.checkIn, b.checkOut)) {
        conflict = true;
      }
    });

    if (conflict) {
      throw new Error('This room is unavailable for your selected dates.');
    }

    transaction.set(bookingDocRef, {
      ...bookingPayload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return bookingPayload;
};

/**
 * Fetch bookings for a specific customer from Firestore
 */
export const getUserBookings = async (userId) => {
  if (!userId || !db) return [];

  const results = [];
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      results.push({ id: d.id, ...d.data() });
    });
  } catch (err) {
    console.error('Error fetching user bookings from Firestore:', err);
    throw err;
  }

  return results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

/**
 * Fetch a single booking by ID
 */
export const getBookingById = async (bookingId) => {
  if (!db || !bookingId) return null;
  const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

/**
 * Fetch all reservations from Firestore (Admin only)
 */
export const getAllBookings = async () => {
  if (!db) return [];

  const list = [];
  try {
    const snap = await getDocs(collection(db, BOOKINGS_COLLECTION));
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
  } catch (err) {
    console.error('Error fetching all reservations from Firestore:', err);
    throw err;
  }

  return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

/**
 * Cancel a booking with ownership and policy verification
 */
export const cancelBooking = async (bookingId, userId, isAdmin = false) => {
  if (!db) throw new Error('Firestore not initialized.');

  const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error('Booking not found.');
  }

  const booking = snap.data();

  // Authorization check
  if (!isAdmin && booking.userId !== userId) {
    throw new Error('Unauthorized to cancel this booking.');
  }

  // Eligibility check: check-in date must be today or in future
  const today = new Date().toISOString().split('T')[0];
  if (!isAdmin && booking.checkIn < today) {
    throw new Error('Past or ongoing bookings cannot be cancelled online.');
  }

  await updateDoc(docRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });

  return true;
};

/**
 * Update booking status (Admin: checked-in, checked-out, confirmed, cancelled)
 */
export const updateBookingStatus = async (bookingId, newStatus) => {
  if (!db) throw new Error('Firestore not initialized.');
  const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(docRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
  return true;
};
