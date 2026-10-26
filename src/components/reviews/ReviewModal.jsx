import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2, AlertCircle, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';
import { getUserBookings } from '../../firebase/bookingService';
import { submitReview } from '../../firebase/reviewService';

export const ReviewModal = ({ isOpen, onClose, onReviewSubmitted }) => {
  const { user, userProfile } = useAuth();
  const { addToast } = useHotel();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEligibleBookings = async () => {
      if (!user) return;
      setLoadingBookings(true);
      try {
        const bookings = await getUserBookings(user.uid);
        setUserBookings(bookings);
        if (bookings.length > 0) {
          setSelectedBookingId(bookings[0].id);
        }
      } catch (err) {
        console.error('Error fetching bookings for review:', err);
      } finally {
        setLoadingBookings(false);
      }
    };

    if (isOpen) {
      fetchEligibleBookings();
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be signed in to submit a review.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please share at least 10 characters detailing your stay experience.');
      return;
    }

    const selectedBooking = userBookings.find((b) => b.id === selectedBookingId);

    setSubmitting(true);
    try {
      await submitReview({
        userId: user.uid,
        userName: userProfile?.fullName || user.displayName || 'Valued Guest',
        userEmail: user.email,
        bookingId: selectedBooking?.id || '',
        bookingReference: selectedBooking?.bookingReference || '',
        roomId: selectedBooking?.roomId || '',
        roomName: selectedBooking?.roomSnapshot?.name || 'Aurora Luxury Stay',
        rating,
        comment: comment.trim(),
      });

      addToast({
        type: 'success',
        title: 'Review Submitted',
        message: 'Thank you for your feedback! Your review has been recorded.',
      });

      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl max-w-lg w-full border border-gold-500/30 p-6 sm:p-8 shadow-luxury-lg space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-navy-100">
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy-900">
              Share Your Experience
            </h2>
            <p className="text-xs text-navy-600 mt-0.5">
              Your verified review helps fellow travelers choose their ideal stay.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-navy-600 hover:bg-navy-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reservation Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
              Select Your Reservation *
            </label>
            {loadingBookings ? (
              <p className="text-xs text-navy-500 animate-pulse">Checking your reservations...</p>
            ) : userBookings.length === 0 ? (
              <div className="p-3 rounded-xl bg-gold-50 border border-gold-200 text-xs text-gold-900">
                You have no active or completed bookings on record. Reviews are restricted to guests with verified stays.
              </div>
            ) : (
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs sm:text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
              >
                {userBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.roomSnapshot?.name} ({b.checkIn} to {b.checkOut}) — Ref: {b.bookingReference}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Star Rating Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-700 block">
              Your Rating (1 to 5 Stars) *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-gold-500 text-gold-500'
                        : 'text-navy-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-gold-700 ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Feedback Text */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
              Review &amp; Hospitality Feedback *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Tell us about the suite ambiance, comfort, extra services, and overall experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
            />
            <span className="text-[11px] text-navy-500">
              Minimum 10 characters required.
            </span>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-navy-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-navy-300 text-navy-700 text-xs font-bold uppercase tracking-wider hover:bg-navy-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || userBookings.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-navy-950" />
              <span>{submitting ? 'Submitting...' : 'Post Verified Review'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
