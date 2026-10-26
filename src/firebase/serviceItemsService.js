import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { INITIAL_SERVICES } from '../utils/seedData';

const SERVICES_COLLECTION = 'services';
const LOCAL_SERVICES_KEY = 'aurora_local_services';

const getLocalServices = () => {
  const data = localStorage.getItem(LOCAL_SERVICES_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_SERVICES_KEY, JSON.stringify(INITIAL_SERVICES));
    return INITIAL_SERVICES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SERVICES;
  }
};

const saveLocalServices = (services) => {
  localStorage.setItem(LOCAL_SERVICES_KEY, JSON.stringify(services));
};

export const getServices = async ({ onlyActive = true } = {}) => {
  let list = [];

  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, SERVICES_COLLECTION));
      if (!snap.empty) {
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
      } else {
        list = [...INITIAL_SERVICES];
      }
    } catch (err) {
      console.warn('Error fetching services from Firestore, using local fallback:', err);
      list = getLocalServices();
    }
  } else {
    list = getLocalServices();
  }

  if (onlyActive) {
    list = list.filter((s) => s.isActive !== false);
  }

  return list;
};

export const addService = async (serviceData) => {
  const serviceId = `srv-${Date.now()}`;
  const payload = {
    ...serviceData,
    price: Number(serviceData.price),
    isActive: serviceData.isActive ?? true,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured() && db) {
    await setDoc(doc(db, SERVICES_COLLECTION, serviceId), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const local = getLocalServices();
  local.push({ id: serviceId, ...payload });
  saveLocalServices(local);

  return { id: serviceId, ...payload };
};

export const updateService = async (serviceId, serviceData) => {
  const updates = {
    ...serviceData,
    price: Number(serviceData.price),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, SERVICES_COLLECTION, serviceId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  const local = getLocalServices();
  const index = local.findIndex((s) => s.id === serviceId);
  if (index !== -1) {
    local[index] = { ...local[index], ...updates };
    saveLocalServices(local);
  }

  return { id: serviceId, ...updates };
};

export const toggleServiceStatus = async (serviceId, isActive) => {
  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, SERVICES_COLLECTION, serviceId), {
      isActive,
      updatedAt: serverTimestamp(),
    });
  }

  const local = getLocalServices();
  const index = local.findIndex((s) => s.id === serviceId);
  if (index !== -1) {
    local[index].isActive = isActive;
    saveLocalServices(local);
  }
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

export const seedInitialServices = async () => {
  if (isFirebaseConfigured() && db) {
    for (const s of INITIAL_SERVICES) {
      await setDoc(doc(db, SERVICES_COLLECTION, s.id), {
        ...s,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }
  saveLocalServices(INITIAL_SERVICES);
  return true;
};
