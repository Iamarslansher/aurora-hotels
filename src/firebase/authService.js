import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';

// Local storage keys for seamless demo mode
const DEMO_USER_KEY = 'aurora_demo_user';

/**
 * Register a new customer
 */
export const registerUser = async ({ email, password, fullName, phone }) => {
  if (isFirebaseConfigured() && auth && db) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: fullName });

    const userProfile = {
      uid: user.uid,
      email: user.email,
      fullName,
      phone: phone || '',
      role: 'customer', // strictly customer by default
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    return { user, profile: userProfile };
  }

  // Fallback demo mode
  const mockUid = `demo-${Date.now()}`;
  const mockProfile = {
    uid: mockUid,
    email,
    fullName,
    phone: phone || '',
    role: 'customer',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockProfile));
  return { user: { uid: mockUid, email, displayName: fullName }, profile: mockProfile };
};

/**
 * Log in an existing user
 */
export const loginUser = async ({ email, password }) => {
  if (isFirebaseConfigured() && auth && db) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);

    let profile = null;
    if (snap.exists()) {
      profile = snap.data();
    } else {
      // create fallback user profile if missing
      profile = {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName || 'Valued Guest',
        role: 'customer',
        createdAt: serverTimestamp(),
      };
      await setDoc(userDocRef, profile);
    }
    return { user, profile };
  }

  // Fallback demo mode login
  const existing = localStorage.getItem(DEMO_USER_KEY);
  if (existing) {
    const parsed = JSON.parse(existing);
    if (parsed.email.toLowerCase() === email.toLowerCase()) {
      return { user: { uid: parsed.uid, email: parsed.email, displayName: parsed.fullName }, profile: parsed };
    }
  }

  // Default demo user on the fly
  const isDemoAdmin = email.toLowerCase().includes('admin');
  const demoProfile = {
    uid: isDemoAdmin ? 'demo-admin-01' : `demo-${Date.now()}`,
    email,
    fullName: isDemoAdmin ? 'Aurora Chief Concierge (Admin)' : 'Guest Traveler',
    role: isDemoAdmin ? 'admin' : 'customer',
    phone: '03001234567',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoProfile));
  return { user: { uid: demoProfile.uid, email, displayName: demoProfile.fullName }, profile: demoProfile };
};

/**
 * Log out
 */
export const logoutUser = async () => {
  if (isFirebaseConfigured() && auth) {
    await signOut(auth);
  }
  localStorage.removeItem(DEMO_USER_KEY);
};

/**
 * Fetch current user profile from Firestore
 */
export const getUserProfile = async (uid) => {
  if (!uid) return null;
  if (isFirebaseConfigured() && db) {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  }

  const stored = localStorage.getItem(DEMO_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

/**
 * Secure Initial Admin Setup
 * Allows promoting a registered user to admin role using an administrative master code
 */
export const promoteToAdmin = async (uid, masterCode) => {
  const REQUIRED_CODE = import.meta.env.VITE_ADMIN_SETUP_CODE || 'AURORA_ADMIN_2026';
  if (masterCode !== REQUIRED_CODE) {
    throw new Error('Invalid Admin Initialization Master Key. Access denied.');
  }

  if (isFirebaseConfigured() && db) {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      role: 'admin',
      updatedAt: serverTimestamp(),
    });
    return true;
  }

  const stored = localStorage.getItem(DEMO_USER_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    parsed.role = 'admin';
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(parsed));
  }
  return true;
};
