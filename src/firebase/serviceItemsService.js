import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { INITIAL_SERVICES } from '../utils/seedData';

const SERVICES_COLLECTION = 'services';

/**
 * Fetch all configured services from Firestore
 */
export const getServices = async ({ onlyActive = true } = {}) => {
  if (!db) {
    throw new Error('Firestore not initialized.');
  }

  const list = [];
  try {
    const snap = await getDocs(collection(db, SERVICES_COLLECTION));
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
  } catch (err) {
    console.error('Error fetching services from Firestore:', err);
    throw err;
  }

  if (onlyActive) {
    return list.filter((s) => s.isActive !== false);
  }

  return list;
};

/**
 * Add a new configurable service (Admin only)
 */
export const addService = async (serviceData) => {
  if (!db) throw new Error('Firestore not initialized.');
  const serviceId = `srv-${Date.now()}`;
  const payload = {
    ...serviceData,
    price: Number(serviceData.price),
    isActive: serviceData.isActive ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, SERVICES_COLLECTION, serviceId), payload);
  return { id: serviceId, ...payload };
};

/**
 * Update service details (Admin only)
 */
export const updateService = async (serviceId, serviceData) => {
  if (!db) throw new Error('Firestore not initialized.');
  const updates = {
    ...serviceData,
    price: Number(serviceData.price),
    updatedAt: serverTimestamp(),
  };

  const docRef = doc(db, SERVICES_COLLECTION, serviceId);
  await updateDoc(docRef, updates);
  return { id: serviceId, ...updates };
};

/**
 * Toggle service active status (Admin only)
 */
export const toggleServiceStatus = async (serviceId, isActive) => {
  if (!db) throw new Error('Firestore not initialized.');
  await updateDoc(doc(db, SERVICES_COLLECTION, serviceId), {
    isActive,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Calculate the cost of a specific service according to its pricing model
 */
export const calculateServiceCost = (service, guests = 1, nights = 1) => {
  const rate = Number(service.price) || 0;
  const numGuests = Number(guests) || 1;
  const numNights = Number(nights) || 1;

  switch (service.pricingModel) {
    case 'per_person_per_day':
      return rate * numGuests * numNights;
    case 'per_person':
      return rate * numGuests;
    case 'per_night':
      return rate * numNights;
    case 'per_stay':
    case 'flat':
    default:
      return rate;
  }
};

/**
 * Seed initial service catalog into Firestore
 */
export const seedInitialServices = async () => {
  if (!db) throw new Error('Firestore not initialized.');

  for (const s of INITIAL_SERVICES) {
    await setDoc(doc(db, SERVICES_COLLECTION, s.id), {
      ...s,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return true;
};
