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
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { isDateRangeOverlapping, calculateNights } from '../utils/dateUtils';
import { checkRoomAvailability, getRoomById } from './roomService';
import { calculateServiceCost } from './serviceItemsService';

const BOOKINGS_COLLECTION = 'bookings';
const LOCAL_BOOKINGS_KEY = 'aurora_local_bookings';

const getLocalBookings = () => {
  const data = localStorage.getItem(LOCAL_BOOKINGS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveLocalBookings = (list) => {
  localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(list));
};

/**
 * Generate a luxury booking reference code
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
 * and saves price snapshots.
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
  selectedServices = [], // array of { service, quantity }
  specialRequests = '',
}) => {
  // 1. Fetch Room Details
  const room = await getRoomById(roomId);
  if (!room) {
    throw new Error('Room not found. Please select a valid room.');
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

  // 4. Concurrency & Availability Verification
  const avail = await checkRoomAvailability(roomId, checkIn, checkOut);
  if (!avail.available) {
    throw new Error('This room is unavailable for your selected dates.');
  }

  // 5. Calculate Trusted Financials & Price Snapshots
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
    userId: userId || 'guest',
    roomId,
    roomSnapshot: {
      id: room.id,
      name: room.name,
      category: room.category,
      roomNumber: room.roomNumber,
      pricePerNight: roomNightlyPrice,
      image: room.images?.[0] || '',
    },
    guestDetails: {
      fullName: guestName,
      phone: guestPhone,
      cnic: guestCNIC, // sensitive; masked in standard views
    },
    guestCount: guests,
    checkIn,
    checkOut,
    nights,
    pricingSnapshot: {
      roomNightlyPrice,
      nights,
      roomSubtotal,
      servicesTotal,
      taxesAndFees: 0, // No fabricated taxes
      grandTotal,
      currency: 'PKR',
    },
    servicesSnapshot,
    specialRequests: specialRequests || '',
    status: 'confirmed', // confirmed, checked-in, checked-out, cancelled
    paymentStatus: 'Pay Upon Arrival (At Check-In)', // Honest statement, no fake card charge
    createdAt: new Date().toISOString(),
  };

  // 6. Firestore Transaction / Secure Storage
  if (isFirebaseConfigured() && db) {
    const bookingDocRef = doc(db, BOOKINGS_COLLECTION, bookingId);

    // Concurrency check inside Firestore transaction
    await runTransaction(db, async (transaction) => {
      // Re-verify availability within transaction scope
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
  }

  // Also persist to local bookings store for demo and immediate reactivity
  const localList = getLocalBookings();
  localList.unshift(bookingPayload);
  saveLocalBookings(localList);

  return bookingPayload;
};

/**
 * Fetch bookings for a specific customer
 */
export const getUserBookings = async (userId) => {
  if (!userId) return [];

  let results = [];

  if (isFirebaseConfigured() && db) {
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
      console.warn('Error querying user bookings from Firestore:', err);
    }
  }

  // Local fallback
  const local = getLocalBookings();
  const matchedLocal = local.filter((b) => b.userId === userId);

  // Merge unique
  const map = new Map();
  [...results, ...matchedLocal].forEach((b) => map.set(b.id, b));
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

/**
 * Fetch all bookings (Admin only)
 */
export const getAllBookings = async () => {
  let list = [];

  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, BOOKINGS_COLLECTION));
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
    } catch (err) {
      console.warn('Error fetching all bookings from Firestore:', err);
    }
  }

  const local = getLocalBookings();
  const map = new Map();
  [...list, ...local].forEach((b) => map.set(b.id, b));
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

/**
 * Cancel a booking
 * Customers can cancel if check-in is in future
 */
export const cancelBooking = async (bookingId, userId, isAdmin = false) => {
  let booking = null;

  if (isFirebaseConfigured() && db) {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      booking = snap.data();
    }
  }

  if (!booking) {
    const local = getLocalBookings();
    booking = local.find((b) => b.id === bookingId);
  }

  if (!booking) {
    throw new Error('Booking not found.');
  }

  // Authorization check
  if (!isAdmin && booking.userId !== userId) {
    throw new Error('Unauthorized to cancel this booking.');
  }

  // Eligibility check: check-in date should be today or in future
  const today = new Date().toISOString().split('T')[0];
  if (!isAdmin && booking.checkIn < today) {
    throw new Error('Past or ongoing bookings cannot be cancelled online.');
  }

  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
  }

  const local = getLocalBookings();
  const idx = local.findIndex((b) => b.id === bookingId);
  if (idx !== -1) {
    local[idx].status = 'cancelled';
    saveLocalBookings(local);
  }

  return true;
};

/**
 * Update booking status (Admin: checked-in, checked-out, confirmed, cancelled)
 */
export const updateBookingStatus = async (bookingId, newStatus) => {
  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  }

  const local = getLocalBookings();
  const idx = local.findIndex((b) => b.id === bookingId);
  if (idx !== -1) {
    local[idx].status = newStatus;
    saveLocalBookings(local);
  }
  return true;
};
