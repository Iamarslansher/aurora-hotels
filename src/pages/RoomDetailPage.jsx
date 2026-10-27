import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Star,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Bed,
  Maximize2,
  Eye,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { formatPKR } from '../utils/formatters';
import { calculateNights, getTodayString, getTomorrowString, addDays } from '../utils/dateUtils';
import { BookingModal } from '../components/booking/BookingModal';

export const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParamsUrl] = useSearchParams();
  const { rooms, isRoomAvailable, searchParams } = useHotel();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(
    searchParamsUrl.get('action') === 'book'
  );

  // Date selection in sidebar widget
  const [checkIn, setCheckIn] = useState(searchParams.checkIn || getTodayString());
  const [checkOut, setCheckOut] = useState(searchParams.checkOut || getTomorrowString());
  const [availabilityStatus, setAvailabilityStatus] = useState(null); // null, 'available', 'unavailable'
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const room = rooms.find((r) => r.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const nights = calculateNights(checkIn, checkOut);
  const estimatedSubtotal = room ? room.pricePerNight * nights : 0;

  // Real-time availability check when dates change
  useEffect(() => {
    if (!room || !checkIn || !checkOut) return;

    let isMounted = true;
    const verify = async () => {
      setCheckingAvailability(true);
      const res = await isRoomAvailable(room.id, checkIn, checkOut);
      if (isMounted) {
        setAvailabilityStatus(res.available ? 'available' : 'unavailable');
        setCheckingAvailability(false);
      }
    };

    verify();
    return () => {
      isMounted = false;
    };
  }, [room, checkIn, checkOut, isRoomAvailable]);

  if (!room) {
    return (
      <div className="min-h-screen bg-ivory pt-32 pb-20 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl border border-gold-500/20 max-w-md shadow-luxury">
          <AlertCircle className="w-12 h-12 text-gold-600 mx-auto mb-3" />
          <h2 className="font-serif text-2xl font-bold text-navy-900">Room Not Found</h2>
          <p className="text-sm text-navy-700 mt-2 mb-6">
            The requested suite may have been archived or does not exist.
          </p>
          <button
            onClick={() => navigate('/rooms')}
            className="px-6 py-2.5 rounded-xl bg-navy-900 text-ivory text-xs font-bold uppercase tracking-wider"
          >
            Back to Room Catalog
          </button>
        </div>
      </div>
    );
  }

  const images = room.images && room.images.length > 0
    ? room.images
    : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-20 text-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back button */}
        <button
          onClick={() => navigate('/rooms')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700 hover:text-gold-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Rooms</span>
        </button>

        {/* Room Header Info */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-navy-900 text-gold-400">
                {room.category}
              </span>
              <span className="text-xs text-navy-500 font-mono">Room {room.roomNumber}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight">
              {room.name}
            </h1>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs uppercase tracking-wider text-navy-600 block">
              {room.pricingUnit === 'day' ? 'Daily Rate' : 'Nightly Rate'}
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-gold-700">
              {formatPKR(room.pricePerNight)}
              <span className="text-sm font-sans font-normal text-navy-600 ml-1">
                / {room.pricingUnit === 'day' ? 'day' : 'night'}
              </span>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Main Large Photo */}
          <div className="lg:col-span-9 h-[380px] sm:h-[480px] rounded-3xl overflow-hidden border border-gold-500/20 shadow-luxury-lg relative">
            <img
              src={images[activeImageIndex]}
              alt={room.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 text-white text-xs bg-navy-950/80 px-3 py-1.5 rounded-lg border border-gold-500/30 backdrop-blur-md">
              Photo {activeImageIndex + 1} of {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative rounded-2xl overflow-hidden h-24 lg:h-36 w-32 lg:w-full shrink-0 border-2 transition-all ${
                  activeImageIndex === idx
                    ? 'border-gold-500 scale-[0.98] shadow-md ring-2 ring-gold-400/40'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content & Reservation Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Details */}
          <div className="lg:col-span-8 space-y-10">
            {/* Quick Specs Pill Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-gold-500/20 shadow-sm text-navy-950">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gold-600 shrink-0" />
                <div>
                  <p className="text-[11px] text-navy-500 uppercase tracking-wider font-semibold">Capacity</p>
                  <p className="text-sm font-bold">{room.capacity} Guest{room.capacity > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Bed className="w-5 h-5 text-gold-600 shrink-0" />
                <div>
                  <p className="text-[11px] text-navy-500 uppercase tracking-wider font-semibold">Bedding</p>
                  <p className="text-sm font-bold">{room.bedType || 'King Bed'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Maximize2 className="w-5 h-5 text-gold-600 shrink-0" />
                <div>
                  <p className="text-[11px] text-navy-500 uppercase tracking-wider font-semibold">Room Size</p>
                  <p className="text-sm font-bold">{room.size || '450 sq ft'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gold-600 shrink-0" />
                <div>
                  <p className="text-[11px] text-navy-500 uppercase tracking-wider font-semibold">Window View</p>
                  <p className="text-sm font-bold truncate">{room.view || 'Resort Garden'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-500/20 shadow-sm space-y-4">
              <h2 className="font-serif text-2xl font-bold text-navy-900">About This Suite</h2>
              <p className="text-navy-700 leading-relaxed text-sm sm:text-base">
                {room.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-500/20 shadow-sm space-y-4">
              <h2 className="font-serif text-2xl font-bold text-navy-900">Amenities &amp; Inclusions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {room.amenities?.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-ivory text-sm text-navy-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel Policies Note */}
            <div className="bg-ivory-300/40 p-6 rounded-2xl border border-gold-500/20 space-y-2 text-xs text-navy-700">
              <h4 className="font-bold text-navy-900 text-sm">
                {room.pricingUnit === 'day' ? 'Meeting Space Policies' : 'Aurora House Policies'}
              </h4>
              {room.pricingUnit === 'day' ? (
                <p>• Meeting room reservations are charged per day and reserved for the selected dates.</p>
              ) : (
                <p>• Check-in begins at 2:00 PM; Check-out is at 12:00 PM.</p>
              )}
              <p>• Government issued CNIC or Passport is required at front desk check-in.</p>
              <p>
                • Free cancellation up to 24 hours prior to scheduled {room.pricingUnit === 'day' ? 'reservation' : 'arrival'} date.
              </p>
            </div>
          </div>

          {/* Right Sidebar Booking Widget */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-3xl border border-gold-500/30 shadow-luxury-lg space-y-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600 block mb-1">
                  Direct Reservation
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-2xl font-bold text-navy-900">
                    {formatPKR(room.pricePerNight)}
                  </span>
                  <span className="text-xs text-navy-500">
                    per {room.pricingUnit === 'day' ? 'day' : 'night'}
                  </span>
                </div>
              </div>

              {/* Date Selectors */}
              <div className="space-y-3 pt-3 border-t border-navy-100">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    {room.pricingUnit === 'day' ? 'Start Date' : 'Check-In'}
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    {room.pricingUnit === 'day' ? 'End Date' : 'Check-Out'}
                  </label>
                  <input
                    type="date"
                    min={addDays(checkIn, 1)}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Availability Indicator */}
              <div className="pt-2">
                {checkingAvailability ? (
                  <p className="text-xs text-navy-500 animate-pulse">Checking live availability...</p>
                ) : availabilityStatus === 'available' ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>This {room.pricingUnit === 'day' ? 'space' : 'suite'} is available for your selected dates.</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>This room is unavailable for your selected dates.</span>
                  </div>
                )}
              </div>

              {/* Estimated Math */}
              <div className="p-4 rounded-xl bg-ivory border border-gold-500/20 text-xs space-y-2">
                <div className="flex justify-between text-navy-700">
                  <span>
                    {nights} {room.pricingUnit === 'day' ? 'day' : 'night'}{nights > 1 ? 's' : ''} {room.pricingUnit === 'day' ? 'booking' : 'stay'}
                  </span>
                  <span className="font-bold text-navy-900">{formatPKR(estimatedSubtotal)}</span>
                </div>
                <div className="flex justify-between text-navy-700">
                  <span>Extra services</span>
                  <span className="text-gold-700 font-semibold">Select at checkout</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={availabilityStatus === 'unavailable' || checkingAvailability}
                onClick={() => setIsBookingOpen(true)}
                className="w-full py-3.5 rounded-xl bg-gold-gradient hover:opacity-95 text-navy-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4 text-navy-950" />
                <span>Reserve This Suite</span>
              </button>

              <p className="text-[11px] text-center text-navy-500">
                Guaranteed price snapshot • Zero double booking
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {isBookingOpen && (
        <BookingModal
          room={room}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </div>
  );
};
