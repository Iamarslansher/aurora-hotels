import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';

// List of designated administrator emails (configurable via environment)
const getAdminEmails = () => {
  const envEmails = import.meta.env.VITE_ADMIN_EMAILS || 'admin@aurorahotels.com';
  return envEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
};

/**
 * Register a new customer.
 * SECURITY: Public registration strictly creates customer accounts.
 * Users can NEVER assign themselves administrative privileges.
 */
export const registerUser = async ({ email, password, fullName, phone }) => {
  if (!auth || !db) {
    throw new Error('Firebase services are not initialized. Check your credentials in .env.local.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: fullName });

  // Check if this email is a designated administrator email
  const isAdminEmail = getAdminEmails().includes(email.toLowerCase());
  const role = isAdminEmail ? 'admin' : 'customer';

  const userProfile = {
    uid: user.uid,
    email: user.email,
    fullName,
    phone: phone || '',
    role, // strictly assigned
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', user.uid), userProfile);
  return { user, profile: userProfile };
};

/**
 * Log in an existing user with Firebase Authentication
 */
export const loginUser = async ({ email, password }) => {
  if (!auth || !db) {
    throw new Error('Firebase services are not initialized. Check your credentials in .env.local.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Retrieve user document from Firestore
  const userDocRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userDocRef);

  let profile = null;
  const isAdminEmail = getAdminEmails().includes(user.email?.toLowerCase());

  if (snap.exists()) {
    profile = snap.data();
    // If designated admin email doesn't have admin role yet, update it
    if (isAdminEmail && profile.role !== 'admin') {
      profile.role = 'admin';
      await updateDoc(userDocRef, { role: 'admin', updatedAt: serverTimestamp() });
    }
  } else {
    // If profile document missing in Firestore, create it
    profile = {
      uid: user.uid,
      email: user.email,
      fullName: user.displayName || 'Guest Traveler',
      phone: '',
      role: isAdminEmail ? 'admin' : 'customer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userDocRef, profile);
  }

  return { user, profile };
};

/**
 * Sign out the currently authenticated user
 */
export const logoutUser = async () => {
  if (auth) {
    await signOut(auth);
  }
};

/**
 * Fetch current user profile document from Firestore
 */
export const getUserProfile = async (uid) => {
  if (!uid || !db) return null;
  const userDocRef = doc(db, 'users', uid);
  const snap = await getDoc(userDocRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
};

/**
 * Update Customer Profile information (Name and Phone)
 * SECURITY: Modifies only contact information. Never alters roles, permissions, or CNIC.
 */
export const updateUserProfile = async (uid, { fullName, phone }) => {
  if (!auth || !db) throw new Error('Firebase not initialized.');
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('Unauthorized profile modification.');
  }

  if (fullName && fullName.trim()) {
    await updateProfile(auth.currentUser, { displayName: fullName.trim() });
  }

  const userDocRef = doc(db, 'users', uid);
  const updates = {
    fullName: fullName ? fullName.trim() : '',
    phone: phone ? phone.trim() : '',
    updatedAt: serverTimestamp(),
  };

  await updateDoc(userDocRef, updates);

  const updatedSnap = await getDoc(userDocRef);
  return updatedSnap.data();
};

/**
 * Send password reset email via Firebase Authentication
 */
export const sendPasswordReset = async (email) => {
  if (!auth) throw new Error('Firebase Auth not initialized.');
  await sendPasswordResetEmail(auth, email);
  return true;
};

/**
 * Change password for the currently signed-in user
 */
export const changePassword = async (newPassword) => {
  if (!auth || !auth.currentUser) {
    throw new Error('You must be signed in to change your password.');
  }
  await updatePassword(auth.currentUser, newPassword);
  return true;
};
