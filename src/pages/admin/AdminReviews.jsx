import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  MessageSquare,
  Filter,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { getAllReviews, updateReviewStatus, deleteReview } from '../../firebase/reviewService';

export const AdminReviews = () => {
  const { addToast } = useHotel();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await updateReviewStatus(reviewId, newStatus);
      addToast({
        type: 'success',
        title: 'Review Status Updated',
        message: `Review has been marked as ${newStatus}.`,
      });
      fetchReviews();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Error',
        message: err.message,
      });
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) {
      return;
    }
    try {
      await deleteReview(reviewId);
      addToast({
        type: 'info',
        title: 'Review Removed',
        message: 'Review permanently deleted from Firestore.',
      });
      fetchReviews();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Delete Error',
        message: err.message,
      });
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold block mb-1">
            Guest Satisfaction &amp; Quality
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900">
            Guest Reviews Moderation
          </h1>
          <p className="text-sm text-navy-700/80 mt-1">
            Review, approve, reject, or remove customer feedback submitted for completed stays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-navy-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-navy-200 text-xs sm:text-sm font-medium text-navy-900 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
          >
            <option value="all">All Statuses ({reviews.length})</option>
            <option value="approved">Approved ({reviews.filter((r) => r.status === 'approved').length})</option>
            <option value="pending">Pending ({reviews.filter((r) => r.status === 'pending').length})</option>
            <option value="rejected">Rejected ({reviews.filter((r) => r.status === 'rejected').length})</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-gold-500/20 shadow-luxury overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-navy-500 animate-pulse">
            Loading reviews from Firestore...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-sm text-navy-600">
            No guest reviews match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-navy-900">
              <thead className="bg-ivory border-b border-navy-100 uppercase tracking-wider text-[11px] text-navy-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Reviewer &amp; Reservation</th>
                  <th className="px-6 py-4 font-semibold">Suite</th>
                  <th className="px-6 py-4 font-semibold">Rating</th>
                  <th className="px-6 py-4 font-semibold">Feedback Text</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {filteredReviews.map((rev) => {
                  const isApproved = rev.status === 'approved';
                  const isPending = rev.status === 'pending';
                  const isRejected = rev.status === 'rejected';

                  return (
                    <tr key={rev.id} className="hover:bg-ivory/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-navy-950">{rev.userName}</p>
                        <span className="text-[11px] text-navy-500 font-mono">
                          {rev.bookingReference ? `Ref: ${rev.bookingReference}` : 'Verified Stay'}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-navy-900">
                        {rev.roomName || 'Aurora Stay'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating
                                  ? 'fill-gold-500 text-gold-500'
                                  : 'text-navy-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-gold-700 font-bold">{rev.rating}/5</span>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs text-navy-800 line-clamp-3 italic">
                          "{rev.comment}"
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-gold-100 text-gold-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {rev.status || 'approved'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isApproved && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(rev.id, 'approved')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1 border border-emerald-300"
                              title="Approve for Public Display"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {!isRejected && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(rev.id, 'rejected')}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs flex items-center gap-1 border border-amber-300"
                              title="Reject Review"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(rev.id)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
