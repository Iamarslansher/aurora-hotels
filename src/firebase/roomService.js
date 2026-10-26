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
import { db, isFirebaseConfigured } from './config';
import { INITIAL_ROOMS } from '../utils/seedData';
import { isDateRangeOverlapping } from '../utils/dateUtils';

const ROOMS_COLLECTION = 'rooms';
const LOCAL_ROOMS_KEY = 'aurora_local_rooms';

/**
 * Initialize local storage rooms if needed
 */
const getLocalRooms = () => {
  const data = localStorage.getItem(LOCAL_ROOMS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(INITIAL_ROOMS));
    return INITIAL_ROOMS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ROOMS;
  }
};

const saveLocalRooms = (rooms) => {
  localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(rooms));
};

/**
 * Fetch all rooms with optional filtering
 */
export const getRooms = async ({ category, minGuests, onlyActive = true } = {}) => {
  let rooms = [];

  if (isFirebaseConfigured() && db) {
    try {
      const q = onlyActive
        ? query(collection(db, ROOMS_COLLECTION), where('isActive', '==', true))
        : collection(db, ROOMS_COLLECTION);
      const snap = await getDocs(q);

      if (!snap.empty) {
        snap.forEach((d) => {
          rooms.push({ id: d.id, ...d.data() });
        });
      } else {
        // If Firestore is empty, return initial seed data
        rooms = [...INITIAL_ROOMS];
      }
    } catch (err) {
      console.warn('Error fetching rooms from Firestore, using local data:', err);
      rooms = getLocalRooms();
    }
  } else {
    rooms = getLocalRooms();
  }

  // Apply filters
  if (category && category !== 'All') {
    rooms = rooms.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  }

  if (minGuests) {
    rooms = rooms.filter((r) => r.capacity >= Number(minGuests));
  }

  return rooms;
};

/**
 * Fetch a single room by ID
 */
export const getRoomById = async (roomId) => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, ROOMS_COLLECTION, roomId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
    } catch (err) {
      console.warn('Firestore room get error, falling back:', err);
    }
  }

  const local = getLocalRooms();
  return local.find((r) => r.id === roomId) || null;
};

/**
 * Add a new room (Admin only)
 */
export const addRoom = async (roomData) => {
  const roomId = `room-${Date.now()}`;
  const payload = {
    ...roomData,
    pricePerNight: Number(roomData.pricePerNight),
    capacity: Number(roomData.capacity),
    isActive: roomData.isActive ?? true,
    rating: roomData.rating || 5.0,
    reviewsCount: roomData.reviewsCount || 1,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured() && db) {
    await setDoc(doc(db, ROOMS_COLLECTION, roomId), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const local = getLocalRooms();
  local.unshift({ id: roomId, ...payload });
  saveLocalRooms(local);

  return { id: roomId, ...payload };
};

/**
 * Update room details (Admin only)
 */
export const updateRoom = async (roomId, roomData) => {
  const updates = {
    ...roomData,
    pricePerNight: Number(roomData.pricePerNight),
    capacity: Number(roomData.capacity),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured() && db) {
    const docRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  const local = getLocalRooms();
  const index = local.findIndex((r) => r.id === roomId);
  if (index !== -1) {
    local[index] = { ...local[index], ...updates };
    saveLocalRooms(local);
  }

  return { id: roomId, ...updates };
};

/**
 * Toggle room active/deactive status (Admin)
 */
export const toggleRoomStatus = async (roomId, isActive) => {
  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      isActive,
      updatedAt: serverTimestamp(),
    });
  }

  const local = getLocalRooms();
  const index = local.findIndex((r) => r.id === roomId);
  if (index !== -1) {
    local[index].isActive = isActive;
    saveLocalRooms(local);
  }
};

/**
 * Check if a room is available for [checkIn, checkOut].
 * Strictly checks against active bookings.
 * Does NOT reveal other guests' details.
 */
export const checkRoomAvailability = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  if (!roomId || !checkIn || !checkOut) return { available: true };

  // Fetch bookings for this room
  let bookings = [];
  if (isFirebaseConfigured() && db) {
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
      console.warn('Falling back to local bookings check:', err);
    }
  }

  // Also check local bookings
  const localBookings = JSON.parse(localStorage.getItem('aurora_local_bookings') || '[]');
  const allBookings = [...bookings, ...localBookings].filter(
    (b) => b.roomId === roomId && ['confirmed', 'checked-in'].includes(b.status)
  );

  for (const b of allBookings) {
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
 * Seed initial rooms into Firestore collection
 */
export const seedInitialRooms = async () => {
  if (isFirebaseConfigured() && db) {
    for (const r of INITIAL_ROOMS) {
      await setDoc(doc(db, ROOMS_COLLECTION, r.id), {
        ...r,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  }
  saveLocalRooms(INITIAL_ROOMS);
  return true;
};
