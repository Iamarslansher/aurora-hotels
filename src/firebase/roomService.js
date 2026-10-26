import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { INITIAL_ROOMS } from '../utils/seedData';
import { isDateRangeOverlapping } from '../utils/dateUtils';

const ROOMS_COLLECTION = 'rooms';

/**
 * Fetch all rooms from Firestore with optional filtering
 */
export const getRooms = async ({ category, minGuests, onlyActive = true } = {}) => {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }

  const rooms = [];
  try {
    const q = onlyActive
      ? query(collection(db, ROOMS_COLLECTION), where('isActive', '==', true))
      : collection(db, ROOMS_COLLECTION);
    const snap = await getDocs(q);

    snap.forEach((d) => {
      rooms.push({ id: d.id, ...d.data() });
    });
  } catch (err) {
    console.error('Error fetching rooms from Firestore:', err);
    throw err;
  }

  // Filter in memory by category and guest capacity
  let filtered = rooms;
  if (category && category !== 'All') {
    filtered = filtered.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  }

  if (minGuests) {
    filtered = filtered.filter((r) => r.capacity >= Number(minGuests));
  }

  return filtered;
};

/**
 * Fetch a single room by ID from Firestore
 */
export const getRoomById = async (roomId) => {
  if (!db || !roomId) return null;
  const docRef = doc(db, ROOMS_COLLECTION, roomId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

/**
 * Add a new room (Admin only)
 */
export const addRoom = async (roomData) => {
  if (!db) throw new Error('Firestore not initialized.');
  const roomId = `room-${Date.now()}`;
  const payload = {
    ...roomData,
    pricePerNight: Number(roomData.pricePerNight),
    capacity: Number(roomData.capacity),
    isActive: roomData.isActive ?? true,
    rating: roomData.rating || 5.0,
    reviewsCount: roomData.reviewsCount || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, ROOMS_COLLECTION, roomId), payload);
  return { id: roomId, ...payload };
};

/**
 * Update room details (Admin only)
 */
export const updateRoom = async (roomId, roomData) => {
  if (!db) throw new Error('Firestore not initialized.');
  const updates = {
    ...roomData,
    pricePerNight: Number(roomData.pricePerNight),
    capacity: Number(roomData.capacity),
    updatedAt: serverTimestamp(),
  };

  const docRef = doc(db, ROOMS_COLLECTION, roomId);
  await updateDoc(docRef, updates);
  return { id: roomId, ...updates };
};

/**
 * Toggle room active/deactivated status (Admin only)
 */
export const toggleRoomStatus = async (roomId, isActive) => {
  if (!db) throw new Error('Firestore not initialized.');
  await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
    isActive,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Check if a room is available for dates [checkIn, checkOut] in Firestore.
 * Strictly checks against active confirmed bookings in Firestore.
 * Does NOT reveal other guests' details.
 */
export const checkRoomAvailability = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  if (!roomId || !checkIn || !checkOut || !db) return { available: true };

  const bookings = [];
  try {
    const q = query(
      collection(db, 'bookings'),
      where('roomId', '==', roomId),
      where('status', 'in', ['confirmed', 'checked-in'])
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      bookings.push({ id: d.id, ...d.data() });
    });
  } catch (err) {
    console.error('Error verifying room availability in Firestore:', err);
    throw err;
  }

  for (const b of bookings) {
    if (excludeBookingId && b.id === excludeBookingId) continue;
    if (isDateRangeOverlapping(checkIn, checkOut, b.checkIn, b.checkOut)) {
      return {
        available: false,
        message: 'This room is unavailable for your selected dates.',
      };
    }
  }

  return { available: true };
};

/**
 * Seed initial luxury room suites into Firestore
 * Admin action to populate an empty database.
 */
export const seedInitialRooms = async () => {
  if (!db) throw new Error('Firestore not initialized.');

  for (const r of INITIAL_ROOMS) {
    await setDoc(doc(db, ROOMS_COLLECTION, r.id), {
      ...r,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return true;
};
