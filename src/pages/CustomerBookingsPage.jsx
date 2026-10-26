import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Users,
  Clock,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Building,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { getUserBookings, cancelBooking } from '../firebase/bookingService';
import { formatPKR, maskCNIC } from '../utils/formatters';

export const CustomerBookingsPage = () => {
  const { user } = useAuth();
  const { addToast } = useHotel();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'confirmed', 'cancelled'
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // In demo mode or live auth, fetch customer reservations
      const userId = user ? user.uid : 'demo-customer-aurora';
      const results = await getUserBookings(userId);
      setBookings(results);
    } catch (err) {
      console.warn('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you wish to cancel this reservation? This cannot be undone.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId, user ? user.uid : 'demo-customer-aurora', false);
      addToast({
        type: 'info',
        title: 'Booking Cancelled',
        message: 'Your reservation has been cancelled per Aurora policy.',
      });
      fetchBookings();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Cancellation Notice',
        message: err.message || 'Could not cancel booking.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'confirmed') return b.status === 'confirmed' || b.status === 'checked-in';
    if (filterTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-20 text-navy-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold block mb-1">
              Customer Portal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900">
              My Reservations
            </h1>
            <p className="text-sm text-navy-700/80 mt-1">
              Review active itineraries, service snapshots, and manage eligible cancellations.
            </p>
          </div>

          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95"
          >
            <span>Book Another Stay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-navy-200 pb-3 mb-8">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              filterTab === 'all'
                ? 'bg-navy-900 text-gold-300'
                : 'text-navy-700 hover:text-navy-950 bg-white'
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setFilterTab('confirmed')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              filterTab === 'confirmed'
                ? 'bg-navy-900 text-gold-300'
                : 'text-navy-700 hover:text-navy-950 bg-white'
            }`}
          >
            Active &amp; Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilterTab('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              filterTab === 'cancelled'
                ? 'bg-navy-900 text-gold-300'
                : 'text-navy-700 hover:text-navy-950 bg-white'
            }`}
          >
            Cancelled ({bookings.filter((b) => b.status === 'cancelled').length})
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-44 animate-pulse border border-navy-100" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gold-500/20 p-8 shadow-luxury max-w-lg mx-auto space-y-4">
            <Calendar className="w-12 h-12 text-gold-600 mx-auto" />
            <h3 className="font-serif text-2xl font-bold text-navy-900">No Reservations Found</h3>
            <p className="text-sm text-navy-700">
              You do not have any {filterTab !== 'all' ? filterTab : ''} bookings under this profile.
            </p>
            <Link
              to="/rooms"
              className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-navy-900 text-ivory text-xs font-bold uppercase tracking-wider"
            >
              Explore Available Rooms
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((b) => {
              const isConfirmed = b.status === 'confirmed';
              const isCancelled = b.status === 'cancelled';
              const today = new Date().toISOString().split('T')[0];
              const isEligibleForCancel = isConfirmed && b.checkIn >= today;

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-gold-500/20 p-6 sm:p-8 shadow-luxury flex flex-col md:flex-row gap-6 justify-between"
                >
                  {/* Left Column: Room & Dates */}
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-bold text-gold-700 bg-gold-50 border border-gold-200 px-2.5 py-1 rounded-md">
                        {b.bookingReference}
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isCancelled
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-navy-100 text-navy-800'
                        }`}
                      >
                        {b.status}
                      </span>
                      <span className="text-xs text-navy-500">
                        Booked on {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-900">
                        {b.roomSnapshot?.name}
                      </h3>
                      <p className="text-xs font-semibold text-gold-700 mt-0.5">
                        {b.roomSnapshot?.category} • Room {b.roomSnapshot?.roomNumber}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-ivory p-3.5 rounded-xl border border-navy-100">
                      <div>
                        <span className="text-navy-500 block">Check-In</span>
                        <span className="font-bold text-navy-900">{b.checkIn}</span>
                      </div>
                      <div>
                        <span className="text-navy-500 block">Check-Out</span>
                        <span className="font-bold text-navy-900">{b.checkOut}</span>
                      </div>
                      <div>
                        <span className="text-navy-500 block">Length of Stay</span>
                        <span className="font-bold text-navy-900">{b.nights} Night{b.nights > 1 ? 's' : ''} ({b.guestCount} Guests)</span>
                      </div>
                    </div>

                    {/* Masked CNIC & Guest details */}
                    <div className="text-xs text-navy-600 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Guest: {b.guestDetails?.fullName} • CNIC: {maskCNIC(b.guestDetails?.cnic)}</span>
                    </div>
                  </div>

                  {/* Right Column: Pricing & Actions */}
                  <div className="md:w-64 flex flex-col justify-between pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-navy-100 md:pl-6 space-y-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-navy-500 block">Total Locked Price</span>
                      <div className="text-2xl font-serif font-bold text-gold-700 mt-0.5">
                        {formatPKR(b.pricingSnapshot?.grandTotal)}
                      </div>
                      <span className="text-[11px] text-emerald-700 block mt-0.5">
                        {b.paymentStatus || 'Pay Upon Arrival'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Link
                        to={`/booking-confirmation/${b.id}`}
                        state={{ booking: b }}
                        className="block w-full py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-ivory text-center text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        View Full Receipt
                      </Link>

                      {isEligibleForCancel && (
                        <button
                          type="button"
                          disabled={cancellingId === b.id}
                          onClick={() => handleCancelBooking(b.id)}
                          className="w-full py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                          {cancellingId === b.id ? 'Processing...' : 'Cancel Reservation'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
