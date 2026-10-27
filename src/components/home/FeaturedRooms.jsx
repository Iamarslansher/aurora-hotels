import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Star, ArrowRight, CheckCircle2, BedSingle } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { formatPKR } from '../../utils/formatters';

export const FeaturedRooms = () => {
  const { rooms } = useHotel();

  // Pick top 3 featured rooms or one from each category
  const single = rooms.find((r) => r.category === 'Single Room') || rooms[0];
  const couple = rooms.find((r) => r.category === 'Couple Room') || rooms[1];
  const friends = rooms.find((r) => r.category === 'Friends Room') || rooms[2];

  const displayRooms = [single, couple, friends].filter(Boolean);

  return (
    <section className="py-20 lg:py-28 bg-ivory text-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold block mb-2">
              Curated Accommodations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight">
              Featured Rooms &amp; Suites
            </h2>
            <p className="mt-3 text-navy-700/80 text-sm sm:text-base leading-relaxed">
              Explore our three core room categories crafted for solo business travelers, romantic getaways, and unforgettable friend retreats.
            </p>
          </div>

          <Link
            to="/rooms"
            className="mt-6 md:mt-0 inline-flex items-center gap-2 text-gold-700 hover:text-gold-800 font-bold text-sm tracking-wide group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Room Cards Grid */}
        {displayRooms.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-3xl border border-gold-500/20 max-w-lg mx-auto space-y-3">
            <h3 className="font-serif text-xl font-bold text-navy-900">Suites Inventory Updating</h3>
            <p className="text-xs text-navy-600">
              Our curated room collections are being synchronized. Please browse all available categories below.
            </p>
            <Link
              to="/rooms"
              className="inline-block px-5 py-2 rounded-xl bg-navy-900 text-ivory text-xs font-bold uppercase tracking-wider"
            >
              Check Rooms Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white rounded-2xl overflow-hidden border border-gold-500/20 shadow-luxury group flex flex-col luxury-card-hover"
            >
              {/* Room Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-black/20" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-navy-900/90 text-gold-400 border border-gold-500/40 backdrop-blur-md">
                    {room.category}
                  </span>
                </div>

                {/* Capacity Pill */}
                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-navy-900 backdrop-blur-md flex items-center gap-1 shadow-sm">
                    <Users className="w-3.5 h-3.5 text-gold-600" />
                    Up to {room.capacity} Guest{room.capacity > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Price Display */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-ivory-300 block">
                      {room.pricingUnit === 'day' ? 'Daily Rate' : 'Nightly Rate'}
                    </span>
                    <div className="text-xl sm:text-2xl font-serif font-bold text-gold-300">
                      {formatPKR(room.pricePerNight)}
                      <span className="text-xs font-sans text-ivory-300 font-normal ml-1">
                        / {room.pricingUnit === 'day' ? 'day' : 'night'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-navy-950/70 border border-gold-500/30 px-2 py-1 rounded-md text-xs text-gold-300 backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                    <span className="font-bold">{room.rating || 4.9}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-navy-900 group-hover:text-gold-700 transition-colors">
                    {room.name}
                  </h3>
                  <p className="mt-2 text-sm text-navy-700/80 line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>

                  {/* Highlights */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {room.amenities?.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-md bg-ivory-300/40 text-navy-800 font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-gold-500/10 flex items-center gap-3">
                  <Link
                    to={`/rooms/${room.id}`}
                    className="flex-1 py-2.5 px-4 text-center rounded-xl bg-navy-900 hover:bg-navy-800 text-ivory text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/rooms/${room.id}?action=book`}
                    className="flex-1 py-2.5 px-4 text-center rounded-xl bg-gold-gradient hover:opacity-95 text-navy-950 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                  >
                    Book Room
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};
