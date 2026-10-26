import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Star,
  SlidersHorizontal,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { formatPKR } from '../utils/formatters';
import { BookingModal } from '../components/booking/BookingModal';
import { getTodayString, getTomorrowString, addDays } from '../utils/dateUtils';

export const RoomsPage = () => {
  const { rooms, loading, searchParams, updateSearch } = useHotel();
  const [urlParams, setUrlParams] = useSearchParams();

  // Active filters
  const [selectedCategory, setSelectedCategory] = useState(
    urlParams.get('category') || searchParams.roomType || 'All'
  );
  const [guestFilter, setGuestFilter] = useState(searchParams.guests || 1);
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc', 'rating'

  // Booking modal state
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);

  const categories = [
    { label: 'All Rooms', value: 'All' },
    { label: 'Single Room (1 Guest)', value: 'Single Room' },
    { label: 'Couple Room (2 Guests)', value: 'Couple Room' },
    { label: 'Friends Room (Up to 5 Guests)', value: 'Friends Room' },
  ];

  // Filter & Sort
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        if (!room.isActive) return false;
        if (selectedCategory !== 'All' && room.category !== selectedCategory) {
          return false;
        }
        if (room.capacity < Number(guestFilter)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.pricePerNight - b.pricePerNight;
        if (sortBy === 'price-desc') return b.pricePerNight - a.pricePerNight;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [rooms, selectedCategory, guestFilter, sortBy]);

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-20 text-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold block mb-2">
            Luxury Catalog
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight">
            Rooms &amp; Designer Suites
          </h1>
          <p className="mt-3 text-navy-700/80 text-sm sm:text-base leading-relaxed">
            Tailored configurations for solo journeys, romantic milestones, and lively friend reunions.
            Select your preferred suite and reserve directly with a locked price snapshot.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gold-500/20 shadow-luxury mb-10 space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-navy-100 pb-4">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-navy-900 text-gold-300 shadow-sm'
                    : 'bg-ivory text-navy-700 hover:text-navy-950 hover:bg-ivory-300/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Secondary Controls (Guests & Sort) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-navy-600 shrink-0">
                Guests:
              </span>
              <select
                value={guestFilter}
                onChange={(e) => setGuestFilter(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-medium text-navy-900 bg-ivory focus:ring-1 focus:ring-gold-500"
              >
                <option value={1}>1+ Guest (Solo or more)</option>
                <option value={2}>2+ Guests (Couples or more)</option>
                <option value={3}>3+ Guests (Friends)</option>
                <option value={4}>4+ Guests (Friends)</option>
                <option value={5}>5 Guests (Max Friends)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-xs font-semibold uppercase tracking-wider text-navy-600 shrink-0">
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-medium text-navy-900 bg-ivory focus:ring-1 focus:ring-gold-500"
              >
                <option value="featured">Featured Suites</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Guest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-96 animate-pulse border border-navy-100" />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gold-500/20 p-8 shadow-luxury max-w-xl mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 text-gold-600 mx-auto" />
            <h3 className="font-serif text-2xl font-bold text-navy-900">
              {rooms.length === 0 ? 'Hotel Catalog Currently Empty' : 'No Matching Suites Found'}
            </h3>
            <p className="text-sm text-navy-700">
              {rooms.length === 0
                ? 'No rooms have been initialized in Firestore yet. Administrators can populate the room inventory via the Admin Operations Hub.'
                : 'No suites match your specific guest count or category filter. Try selecting "All Rooms" or lowering your guest count.'}
            </p>
            {rooms.length > 0 ? (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setGuestFilter(1);
                }}
                className="mt-2 px-6 py-2.5 rounded-xl bg-navy-900 text-ivory text-xs font-bold uppercase tracking-wider"
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room, idx) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-white rounded-2xl overflow-hidden border border-gold-500/20 shadow-luxury group flex flex-col luxury-card-hover"
              >
                {/* Photo & Badges */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-black/20" />

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-navy-900/90 text-gold-400 border border-gold-500/40 backdrop-blur-md">
                      {room.category}
                    </span>
                  </div>

                  {/* Capacity Pill */}
                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-navy-900 backdrop-blur-md flex items-center gap-1 shadow-sm">
                      <Users className="w-3.5 h-3.5 text-gold-600" />
                      Up to {room.capacity} Guest{room.capacity > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ivory-300 block">Nightly Price</span>
                      <div className="text-xl sm:text-2xl font-serif font-bold text-gold-300">
                        {formatPKR(room.pricePerNight)}
                        <span className="text-xs font-sans text-ivory-300 font-normal ml-1">/ night</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-navy-950/70 border border-gold-500/30 px-2 py-1 rounded-md text-xs text-gold-300 backdrop-blur-sm">
                      <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                      <span className="font-bold">{room.rating || 4.9}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-navy-500 font-mono">Room {room.roomNumber}</span>
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Guaranteed Available
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-navy-900 mt-1 group-hover:text-gold-700 transition-colors">
                      {room.name}
                    </h3>
                    <p className="mt-2 text-sm text-navy-700/80 line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>

                    {/* Amenities chips */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {room.amenities?.slice(0, 3).map((a, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-md bg-ivory-300/40 text-navy-800 font-medium flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gold-500/10 flex items-center gap-3">
                    <a
                      href={`/rooms/${room.id}`}
                      className="flex-1 py-2.5 px-4 text-center rounded-xl bg-navy-900 hover:bg-navy-800 text-ivory text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Details &amp; Photos
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedRoomForBooking(room)}
                      className="flex-1 py-2.5 px-4 text-center rounded-xl bg-gold-gradient hover:opacity-95 text-navy-950 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Checkout Modal */}
      {selectedRoomForBooking && (
        <BookingModal
          room={selectedRoomForBooking}
          isOpen={Boolean(selectedRoomForBooking)}
          onClose={() => setSelectedRoomForBooking(null)}
        />
      )}
    </div>
  );
};
