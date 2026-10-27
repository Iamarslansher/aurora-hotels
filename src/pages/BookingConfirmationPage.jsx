import React from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  Printer,
  ArrowRight,
  Home,
  Clock,
  Lock,
} from 'lucide-react';
import { formatPKR, maskCNIC } from '../utils/formatters';

import { getBookingById } from '../firebase/bookingService';

export const BookingConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = React.useState(location.state?.booking || null);
  const [loading, setLoading] = React.useState(!location.state?.booking);

  React.useEffect(() => {
    if (!booking && id) {
      setLoading(true);
      getBookingById(id)
        .then((data) => setBooking(data))
        .catch((err) => console.error('Error fetching booking from Firestore:', err))
        .finally(() => setLoading(false));
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory pt-32 pb-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-gold-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-ivory pt-32 pb-20 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl border border-gold-500/20 max-w-md shadow-luxury">
          <h2 className="font-serif text-2xl font-bold text-navy-900">Reservation Record</h2>
          <p className="text-sm text-navy-700 mt-2 mb-6">
            Unable to display live receipt. Please visit your customer booking dashboard.
          </p>
          <Link
            to="/customer/bookings"
            className="px-6 py-2.5 rounded-xl bg-navy-900 text-ivory text-xs font-bold uppercase tracking-wider"
          >
            Go to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };
  const durationUnit = booking.roomSnapshot?.pricingUnit === 'day' ? 'day' : 'night';

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-20 text-navy-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Card */}
        <div className="bg-white rounded-3xl border border-gold-500/30 shadow-luxury-lg overflow-hidden">
          {/* Header Banner */}
          <div className="bg-navy-950 text-ivory p-8 text-center relative border-b border-gold-500/30">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-400 block mb-1">
              Guaranteed Reservation Confirmed
            </span>
            <h1 className="font-serif text-3xl font-bold text-ivory">
              Welcome to Aurora Hotels
            </h1>
            <p className="text-sm text-ivory-300 mt-2">
              Your stay has been locked with a guaranteed price snapshot and zero double bookings.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-900 border border-gold-500/40 text-gold-300 font-mono text-sm font-bold">
              <span>Reference: {booking.bookingReference}</span>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Guest & Room Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-ivory border border-gold-500/20">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy-500 block mb-1">
                  Primary Guest
                </span>
                <p className="font-bold text-navy-950">{booking.guestDetails?.fullName}</p>
                <p className="text-xs text-navy-600 mt-0.5">{booking.guestDetails?.phone}</p>
                <p className="text-xs text-navy-500 font-mono mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  CNIC: {maskCNIC(booking.guestDetails?.cnic)}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy-500 block mb-1">
                  Room Configuration
                </span>
                <p className="font-bold text-navy-950">{booking.roomSnapshot?.name}</p>
                <p className="text-xs text-gold-700 font-semibold">{booking.roomSnapshot?.category}</p>
                <p className="text-xs text-navy-600 mt-0.5">
                  {booking.guestCount} Guest{booking.guestCount > 1 ? 's' : ''} • Room {booking.roomSnapshot?.roomNumber}
                </p>
              </div>
            </div>

            {/* Stay Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center p-4 rounded-xl bg-navy-950 text-ivory">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gold-400 block">
                  {durationUnit === 'day' ? 'Start Date' : 'Check-In'}
                </span>
                <p className="font-serif font-bold text-lg mt-0.5">{booking.checkIn}</p>
                {durationUnit !== 'day' && (
                  <span className="text-[10px] text-ivory-400">After 2:00 PM</span>
                )}
              </div>
              <div className="border-y sm:border-y-0 sm:border-x border-navy-800 py-2 sm:py-0">
                <span className="text-[10px] uppercase tracking-wider text-gold-400 block">Duration</span>
                <p className="font-serif font-bold text-lg mt-0.5">
                  {booking.nights} {durationUnit}{booking.nights > 1 ? 's' : ''}
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {durationUnit === 'day' ? 'Reserved' : 'Active Stay'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gold-400 block">
                  {durationUnit === 'day' ? 'End Date' : 'Check-Out'}
                </span>
                <p className="font-serif font-bold text-lg mt-0.5">{booking.checkOut}</p>
                {durationUnit !== 'day' && (
                  <span className="text-[10px] text-ivory-400">Before 12:00 PM</span>
                )}
              </div>
            </div>

            {/* Itemized Price Breakdown */}
            <div className="space-y-3 pt-4 border-t border-navy-100">
              <h3 className="font-serif text-lg font-bold text-navy-900">
                Price Snapshot &amp; Services
              </h3>

              <div className="flex justify-between text-sm text-navy-700">
                <span>
                  Room Subtotal ({booking.nights} {durationUnit}{booking.nights > 1 ? 's' : ''} × {formatPKR(booking.pricingSnapshot?.roomNightlyPrice)})
                </span>
                <span className="font-semibold text-navy-950">
                  {formatPKR(booking.pricingSnapshot?.roomSubtotal)}
                </span>
              </div>

              {/* Extra Services snapshot */}
              {booking.servicesSnapshot?.map((s, idx) => (
                <div key={idx} className="flex justify-between text-xs text-navy-600 pl-3 border-l-2 border-gold-300">
                  <span>+ {s.name} ({s.pricingModel})</span>
                  <span className="font-semibold text-navy-900">{formatPKR(s.calculatedCost)}</span>
                </div>
              ))}

              <div className="pt-3 border-t border-gold-500/30 flex justify-between items-center text-lg font-bold text-navy-950">
                <span>Total Amount Due</span>
                <span className="font-serif text-2xl text-gold-700">
                  {formatPKR(booking.pricingSnapshot?.grandTotal)}
                </span>
              </div>

              {/* Honest payment notice */}
              <div className="p-3 rounded-xl bg-gold-50 border border-gold-200 text-gold-900 text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-700 shrink-0" />
                <span>
                  <strong>Payment Notice:</strong> {booking.paymentStatus || 'Pay Upon Arrival (At Check-In)'}.
                  No charges have been made online.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-navy-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl border border-navy-300 text-navy-900 text-xs font-bold uppercase tracking-wider hover:bg-navy-50 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>

              <div className="flex items-center gap-3">
                <Link
                  to="/customer/bookings"
                  className="px-6 py-2.5 rounded-xl bg-navy-900 text-ivory text-xs font-bold uppercase tracking-wider hover:bg-navy-800 transition-colors"
                >
                  View My Bookings
                </Link>
                <Link
                  to="/"
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-navy-950 text-xs font-bold uppercase tracking-wider hover:opacity-95 shadow-sm"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
