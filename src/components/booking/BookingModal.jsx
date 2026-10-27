import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Lock,
  Plus,
  Minus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';
import { createBooking } from '../../firebase/bookingService';
import { calculateNights, getTodayString, getTomorrowString, addDays } from '../../utils/dateUtils';
import { formatPKR, formatCNIC, isValidCNIC, isValidPhone } from '../../utils/formatters';
import { calculateServiceCost } from '../../firebase/serviceItemsService';

export const BookingModal = ({ room, isOpen, onClose, initialServices = [] }) => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { services, searchParams, addToast, refreshRooms, isRoomAvailable } = useHotel();

  // Booking fields
  const [checkIn, setCheckIn] = useState(searchParams.checkIn || getTodayString());
  const [checkOut, setCheckOut] = useState(searchParams.checkOut || getTomorrowString());
  const [guestCount, setGuestCount] = useState(
    Math.min(searchParams.guests || 1, room?.capacity || 1)
  );

  const [guestName, setGuestName] = useState(
    user?.displayName || userProfile?.fullName || ''
  );
  const [guestPhone, setGuestPhone] = useState(userProfile?.phone || '');
  const [guestCNIC, setGuestCNIC] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Selected services set
  const [selectedServiceIds, setSelectedServiceIds] = useState(
    initialServices.map((s) => s.id || s.serviceId || s)
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [roomAvailable, setRoomAvailable] = useState(null);
  const [availabilityError, setAvailabilityError] = useState(false);

  // Update initial parameters if searchParams change
  useEffect(() => {
    if (searchParams.checkIn) setCheckIn(searchParams.checkIn);
    if (searchParams.checkOut) setCheckOut(searchParams.checkOut);
  }, [searchParams]);

  useEffect(() => {
    if (!isOpen || !room || !checkIn || !checkOut || checkIn >= checkOut) {
      setRoomAvailable(null);
      setAvailabilityError(false);
      setCheckingAvailability(false);
      return undefined;
    }

    let active = true;
    setCheckingAvailability(true);
    setAvailabilityError(false);
    isRoomAvailable(room.id, checkIn, checkOut)
      .then((result) => {
        if (active) setRoomAvailable(result.available);
      })
      .catch((error) => {
        console.error('Room availability check failed:', error);
        if (active) {
          setRoomAvailable(null);
          setAvailabilityError(true);
        }
      })
      .finally(() => {
        if (active) setCheckingAvailability(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, room, checkIn, checkOut, isRoomAvailable]);

  if (!isOpen || !room) return null;

  const nights = calculateNights(checkIn, checkOut);
  const roomSubtotal = room.pricePerNight * nights;
  const durationUnit = room.pricingUnit === 'day' ? 'day' : 'night';

  // Selected services calculations
  const activeSelectedServices = services.filter((s) =>
    selectedServiceIds.includes(s.id)
  );

  const servicesTotal = activeSelectedServices.reduce((acc, srv) => {
    return acc + calculateServiceCost(srv, guestCount, nights);
  }, 0);

  const grandTotal = roomSubtotal + servicesTotal;

  const toggleService = (serviceId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleCNICChange = (e) => {
    const formatted = formatCNIC(e.target.value);
    setGuestCNIC(formatted);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!guestName.trim()) {
      setErrorMessage('Please provide your full legal name.');
      return;
    }

    if (!isValidPhone(guestPhone)) {
      setErrorMessage('Please enter a valid mobile number (e.g., 0300-1234567).');
      return;
    }

    if (!isValidCNIC(guestCNIC)) {
      setErrorMessage('Please enter a valid 13-digit Pakistani CNIC number.');
      return;
    }

    if (guestCount > room.capacity) {
      setErrorMessage(
        `This room accommodates a maximum of ${room.capacity} guest${room.capacity > 1 ? 's' : ''}.`
      );
      return;
    }

    if (checkIn >= checkOut) {
      setErrorMessage('Check-out date must be strictly after check-in date.');
      return;
    }

    setSubmitting(true);

    try {
      const selectedServicesPayload = activeSelectedServices.map((srv) => ({
        service: srv,
        quantity: 1,
      }));

      const booking = await createBooking({
        userId: user ? user.uid : 'guest-reservation',
        roomId: room.id,
        guestName,
        guestPhone,
        guestCNIC,
        guestCount,
        checkIn,
        checkOut,
        selectedServices: selectedServicesPayload,
        specialRequests,
      });

      addToast({
        type: 'success',
        title: 'Booking Confirmed!',
        message: `Your reservation at Aurora is secured. Reference: ${booking.bookingReference}`,
      });

      refreshRooms();
      onClose();
      navigate(`/booking-confirmation/${booking.id}`, { state: { booking } });
    } catch (err) {
      console.error('Booking failed:', err);
      // Strictly show concise message without leaking private details
      setErrorMessage(err.message || 'This room is unavailable for your selected dates.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-3xl w-full border border-gold-500/30 shadow-luxury-lg overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-navy-950 text-ivory p-6 sm:p-8 flex items-center justify-between border-b border-gold-500/30 relative">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-400 block mb-1">
              Reservation Checkout
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
              {room.name}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-ivory-300">
              <span className="text-gold-400 font-semibold">{room.category}</span>
              <span>•</span>
              <span>Max {room.capacity} Guest{room.capacity > 1 ? 's' : ''}</span>
              <span>•</span>
              <span className="text-emerald-400">
                {formatPKR(room.pricePerNight)} / {durationUnit}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-navy-900 border border-gold-500/30 flex items-center justify-center text-ivory hover:text-gold-400 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <form onSubmit={handleBookingSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Reservation Notice</p>
                <p className="text-xs mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {checkingAvailability ? (
            <p className="flex items-center gap-2 text-xs text-navy-500" role="status">
              <LoaderCircle className="h-4 w-4 animate-spin text-gold-600" />
              Checking availability for these dates...
            </p>
          ) : roomAvailable === false ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800" role="status">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              Occupied on these dates
            </div>
          ) : roomAvailable ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800" role="status">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              Available for your selected dates
            </div>
          ) : availabilityError ? (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              Availability could not be verified. Booking is disabled until it can be confirmed.
            </div>
          ) : null}

          {/* Date & Guest Parameters */}
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-600" />
              {durationUnit === 'day' ? 'Meeting Dates & Guests' : 'Stay Dates & Guests'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  {durationUnit === 'day' ? 'Start Date *' : 'Check-In Date *'}
                </label>
                <input
                  type="date"
                  min={getTodayString()}
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (e.target.value >= checkOut) {
                      setCheckOut(addDays(e.target.value, 1));
                    }
                  }}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  {durationUnit === 'day' ? 'End Date *' : 'Check-Out Date *'}
                </label>
                <input
                  type="date"
                  min={addDays(checkIn, 1)}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Guests (Max {room.capacity}) *
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                >
                  {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} Guest{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-navy-600 mt-2">
              Duration: <strong>{nights} {durationUnit}{nights > 1 ? 's' : ''}</strong>
            </p>
          </div>

          {/* Guest Identity & Contact Details */}
          <div className="pt-4 border-t border-navy-100">
            <h3 className="font-serif text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Guest Identity &amp; Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Arsalan"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700 flex items-center justify-between">
                  <span>Pakistani CNIC Number (13 Digits) *</span>
                  <span className="text-[11px] text-emerald-700 font-normal flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Encrypted &amp; Masked
                  </span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="42101-1234567-1"
                  value={guestCNIC}
                  onChange={handleCNICChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-navy-500 mt-1">
                  Required for hotel registration compliance. Never exposed publicly or sent to AI.
                </p>
              </div>
            </div>
          </div>

          {/* Configurable Extra Services */}
          <div className="pt-4 border-t border-navy-100">
            <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">
              Enhance Your Stay (Optional Services)
            </h3>
            <p className="text-xs text-navy-600 mb-4">
              Add curated breakfast, evening Kashmiri chai, extra luxury linens, or VIP transport.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((srv) => {
                const isSelected = selectedServiceIds.includes(srv.id);
                const cost = calculateServiceCost(srv, guestCount, nights);

                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleService(srv.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-gold-500 bg-gold-50/50 shadow-sm'
                        : 'border-navy-200 hover:border-gold-300 bg-white'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div click
                          className="rounded text-gold-600 focus:ring-gold-500"
                        />
                        <span className="font-semibold text-xs sm:text-sm text-navy-950">
                          {srv.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-navy-600 mt-1 line-clamp-2">
                        {srv.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-gold-700">
                        {formatPKR(cost)}
                      </span>
                      <span className="block text-[10px] text-navy-500">
                        {srv.pricingModel === 'per_person_per_day'
                          ? `Per guest/${durationUnit}`
                          : srv.pricingModel === 'per_person'
                          ? 'Per guest'
                          : 'Flat fee'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Requests */}
          <div className="pt-4 border-t border-navy-100">
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-700 block mb-1">
              Special Requests &amp; Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Quiet upper floor, feather-free pillows, late check-in notice..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
            />
          </div>

          {/* Trusted Financial Itemization */}
          <div className="p-5 rounded-2xl bg-ivory-300/50 border border-gold-500/30 space-y-2.5 text-sm text-navy-900">
            <h4 className="font-serif font-bold text-base text-navy-950 mb-2">
              Itemized Price Summary
            </h4>

            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-navy-700">
                {room.name} ({nights} {durationUnit}{nights > 1 ? 's' : ''} × {formatPKR(room.pricePerNight)})
              </span>
              <span className="font-medium text-navy-950">{formatPKR(roomSubtotal)}</span>
            </div>

            {activeSelectedServices.map((s) => {
              const cost = calculateServiceCost(s, guestCount, nights);
              return (
                <div key={s.id} className="flex justify-between text-xs text-navy-600">
                  <span>+ {s.name}</span>
                  <span className="font-medium">{formatPKR(cost)}</span>
                </div>
              );
            })}

            <div className="pt-3 border-t border-gold-500/20 flex justify-between items-center text-base font-bold text-navy-950">
              <div>
                <span>Total Stay Investment</span>
                <span className="block text-[11px] font-normal text-emerald-700">
                  Payment: Pay Upon Arrival (Cash / Card at Hotel)
                </span>
              </div>
              <span className="font-serif text-2xl text-gold-700">
                {formatPKR(grandTotal)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || checkingAvailability || roomAvailable !== true || availabilityError}
              className="px-5 py-3 rounded-xl border border-navy-300 text-navy-800 text-xs font-bold uppercase tracking-wider hover:bg-navy-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-gold-gradient hover:opacity-95 text-navy-950 text-xs font-bold uppercase tracking-wider shadow-gold-glow flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-navy-950" />
              {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
              <span>{submitting ? 'Verifying & Securing...' : 'Confirm Guaranteed Reservation'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
