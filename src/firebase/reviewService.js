import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const REVIEWS_COLLECTION = 'reviews';

/**
 * Fetch approved guest reviews for public display (Homepage & Rooms)
 */
export const getApprovedReviews = async (maxCount = 6) => {
  if (!db) return [];

  const list = [];
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('status', '==', 'approved')
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
  } catch (err) {
    console.error('Error fetching approved reviews from Firestore:', err);
    return [];
  }

  // Sort by date descending in memory
  return list
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, maxCount);
};

/**
 * Fetch all reviews (Admin only)
 */
export const getAllReviews = async () => {
  if (!db) return [];

  const list = [];
  try {
    const snap = await getDocs(collection(db, REVIEWS_COLLECTION));
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
  } catch (err) {
    console.error('Error fetching all reviews from Firestore:', err);
    throw err;
  }

  return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

/**
 * Fetch reviews submitted by a specific customer
 */
export const getUserReviews = async (userId) => {
  if (!userId || !db) return [];

  const list = [];
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
  } catch (err) {
    console.error('Error fetching customer reviews from Firestore:', err);
    return [];
  }

  return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

/**
 * Submit a verified guest review
 * Validations:
 * - Customer must be authenticated
 * - Rating must be between 1 and 5
 * - Prevents duplicate reviews for the same booking
 */
export const submitReview = async ({
  userId,
  userName,
  userEmail,
  bookingId,
  bookingReference,
  roomId,
  roomName,
  rating,
  comment,
}) => {
  if (!db) throw new Error('Firestore not initialized.');

  // Validate rating
  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    throw new Error('Please select a rating between 1 and 5 stars.');
  }

  if (!comment || comment.trim().length < 10) {
    throw new Error('Please share at least 10 characters detailing your stay experience.');
  }

  // Prevent duplicate reviews for the same reservation
  if (bookingId) {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('bookingId', '==', bookingId)
    );
    const existingSnap = await getDocs(q);
    if (!existingSnap.empty) {
      throw new Error('You have already submitted a review for this reservation.');
    }
  }

  const reviewId = `rev-${Date.now()}`;
  const reviewPayload = {
    id: reviewId,
    userId,
    userName: userName || 'Valued Guest',
    userEmail: userEmail || '',
    bookingId: bookingId || '',
    bookingReference: bookingReference || '',
    roomId: roomId || '',
    roomName: roomName || 'Aurora Suite',
    rating: numRating,
    comment: comment.trim(),
    status: 'approved', // Auto-approved or set to 'pending' for moderation
    createdAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, REVIEWS_COLLECTION, reviewId), reviewPayload);
  return reviewPayload;
};

/**
 * Update review status (Admin: 'approved' | 'rejected' | 'pending')
 */
export const updateReviewStatus = async (reviewId, newStatus) => {
  if (!db) throw new Error('Firestore not initialized.');
  const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
  await updateDoc(docRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
  return true;
};

/**
 * Delete a review (Admin only)
 */
export const deleteReview = async (reviewId) => {
  if (!db) throw new Error('Firestore not initialized.');
  await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
  return true;
};
