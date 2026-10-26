import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Home, Search, ArrowRight } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { getTodayString, getTomorrowString, addDays } from '../../utils/dateUtils';

export const SearchBar = ({ variant = 'hero' }) => {
  const navigate = useNavigate();
  const { searchParams, updateSearch } = useHotel();

  const [checkIn, setCheckIn] = useState(searchParams.checkIn || getTodayString());
  const [checkOut, setCheckOut] = useState(searchParams.checkOut || getTomorrowString());
  const [guests, setGuests] = useState(searchParams.guests || 2);
  const [roomType, setRoomType] = useState(searchParams.roomType || 'All');

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);
    // Ensure check-out is after check-in
    if (newCheckIn >= checkOut) {
      setCheckOut(addDays(newCheckIn, 1));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateSearch({
      checkIn,
      checkOut,
      guests: Number(guests),
      roomType,
    });
    navigate('/rooms');
  };

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={handleSearch}
      className={`w-full transition-all ${
        isHero
          ? 'bg-navy-950/85 backdrop-blur-xl border border-gold-500/30 p-4 sm:p-6 rounded-2xl shadow-luxury-lg text-ivory'
          : 'bg-white border border-gold-500/20 p-4 rounded-xl shadow-luxury text-navy-900'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {/* Check In */}
        <div className="space-y-1.5">
          <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isHero ? 'text-gold-400' : 'text-gold-600'}`}>
            <Calendar className="w-3.5 h-3.5" />
            Check-In
          </label>
          <input
            type="date"
            min={getTodayString()}
            value={checkIn}
            onChange={handleCheckInChange}
            required
            className={`w-full px-3.5 py-2.5 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all ${
              isHero
                ? 'bg-navy-900/90 border-navy-700 text-ivory [color-scheme:dark]'
                : 'bg-ivory border-gold-200 text-navy-950 [color-scheme:light]'
            }`}
          />
        </div>

        {/* Check Out */}
        <div className="space-y-1.5">
          <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isHero ? 'text-gold-400' : 'text-gold-600'}`}>
            <Calendar className="w-3.5 h-3.5" />
            Check-Out
          </label>
          <input
            type="date"
            min={addDays(checkIn, 1)}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className={`w-full px-3.5 py-2.5 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all ${
              isHero
                ? 'bg-navy-900/90 border-navy-700 text-ivory [color-scheme:dark]'
                : 'bg-ivory border-gold-200 text-navy-950 [color-scheme:light]'
            }`}
          />
        </div>

        {/* Guest Count */}
        <div className="space-y-1.5">
          <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isHero ? 'text-gold-400' : 'text-gold-600'}`}>
            <Users className="w-3.5 h-3.5" />
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={`w-full px-3.5 py-2.5 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all ${
              isHero
                ? 'bg-navy-900/90 border-navy-700 text-ivory'
                : 'bg-ivory border-gold-200 text-navy-950'
            }`}
          >
            <option value={1}>1 Guest (Solo / Single)</option>
            <option value={2}>2 Guests (Couple / Pair)</option>
            <option value={3}>3 Guests (Friends / Family)</option>
            <option value={4}>4 Guests (Friends / Family)</option>
            <option value={5}>5 Guests (Friends Villa)</option>
          </select>
        </div>

        {/* Room Category */}
        <div className="space-y-1.5">
          <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isHero ? 'text-gold-400' : 'text-gold-600'}`}>
            <Home className="w-3.5 h-3.5" />
            Room Category
          </label>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all ${
              isHero
                ? 'bg-navy-900/90 border-navy-700 text-ivory'
                : 'bg-ivory border-gold-200 text-navy-950'
            }`}
          >
            <option value="All">All Categories</option>
            <option value="Single Room">Single Room (1 Guest)</option>
            <option value="Couple Room">Couple Room (2 Guests)</option>
            <option value="Friends Room">Friends Room (Up to 5 Guests)</option>
          </select>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gold-gradient hover:opacity-95 text-navy-950 font-bold text-sm tracking-wide shadow-gold-glow flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all"
        >
          <Search className="w-4 h-4 text-navy-950" />
          <span>Check Room Availability</span>
          <ArrowRight className="w-4 h-4 text-navy-950 ml-1" />
        </button>
      </div>
    </form>
  );
};
