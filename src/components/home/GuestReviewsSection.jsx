import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquareQuote, ShieldCheck, Plus, Sparkles, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApprovedReviews } from '../../firebase/reviewService';
import { ReviewModal } from '../reviews/ReviewModal';

export const GuestReviewsSection = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getApprovedReviews(4);
      setReviews(data);
    } catch (err) {
      console.error('Error fetching approved reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-white text-navy-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold block mb-2">
              Verified Testimonials
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight">
              Guest Experiences &amp; Reviews
            </h2>
            <p className="mt-3 text-navy-700/80 text-sm sm:text-base leading-relaxed">
              Read verified testimonials submitted by guests who completed stays at Aurora Hotels &amp; Bookings.
            </p>
          </div>

          <div>
            {user ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
              >
                <Plus className="w-4 h-4 text-navy-950" />
                <span>Write a Guest Review</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 text-ivory font-bold text-xs uppercase tracking-wider hover:bg-navy-800 transition-colors"
              >
                <span>Sign In to Leave Feedback</span>
              </Link>
            )}
          </div>
        </div>

        {/* Reviews Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-ivory rounded-3xl h-56 animate-pulse border border-navy-100" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          /* Clean, elegant empty state when no reviews exist in Firestore */
          <div className="text-center py-16 px-6 bg-ivory rounded-3xl border border-gold-500/20 max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-600">
              <Star className="w-7 h-7 fill-gold-600 text-gold-600" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-navy-900">
              No Guest Reviews Published Yet
            </h3>
            <p className="text-sm text-navy-700/80 max-w-md mx-auto leading-relaxed">
              Be the first to share your experience after completing your stay at Aurora Hotels &amp; Bookings.
              All feedback is verified directly through actual reservations.
            </p>
            {user && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-900 text-ivory font-bold text-xs uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Your Stay Review</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((rev, idx) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-ivory/60 rounded-3xl p-6 sm:p-8 border border-gold-500/20 shadow-luxury flex flex-col justify-between space-y-6 hover:border-gold-500/40 transition-colors"
              >
                <div className="space-y-4">
                  {/* Stars & Verified Stay Pill */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rev.rating
                              ? 'fill-gold-500 text-gold-500'
                              : 'text-navy-200'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified Stay
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm text-navy-800 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Reviewer Details */}
                <div className="pt-4 border-t border-navy-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-navy-900 text-gold-400 font-bold text-xs flex items-center justify-center">
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-950">{rev.userName}</p>
                      <p className="text-[11px] text-gold-700 font-medium">{rev.roomName || 'Aurora Stay'}</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-navy-500 font-medium">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onReviewSubmitted={loadReviews}
        />
      )}
    </section>
  );
};
