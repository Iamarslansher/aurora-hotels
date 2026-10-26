import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BedDouble, ShieldCheck, Star } from 'lucide-react';
import { SearchBar } from './SearchBar';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Background Video with Poster Fallback */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
          className="w-full h-full object-cover scale-105 filter brightness-75"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-a-luxurious-hotel-bedroom-7546/1080p.mp4"
            type="video/mp4"
          />
        </video>
        {/* Dark Luxury Vignette & Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/75 to-navy-950/65" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-navy-950/40 to-navy-950/90" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* Trust & Accolade Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs sm:text-sm font-medium tracking-wide mb-6 backdrop-blur-md"
        >
          <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
          <span>Award-Winning 5-Star Boutique Hospitality</span>
          <span className="hidden sm:inline text-gold-500/50">•</span>
          <span className="hidden sm:inline text-ivory-200">Zero Double-Booking Guarantee</span>
        </motion.div>

        {/* Mandatory Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-ivory tracking-tight leading-[1.1] max-w-5xl mx-auto"
        >
          Your Perfect Stay, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gold-gradient">
            Thoughtfully Planned.
          </span>
        </motion.h1>

        {/* Mandatory Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-ivory-200/90 max-w-2xl mx-auto font-light leading-relaxed"
        >
          Discover comfortable rooms, personalized hospitality, and smarter stays with
          AI-powered planning.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/rooms"
            className="px-8 py-3.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm tracking-wide shadow-gold-glow hover:opacity-95 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <BedDouble className="w-4 h-4 text-navy-950" />
            <span>Explore Rooms</span>
          </Link>
          <Link
            to="/ai-planner"
            className="px-8 py-3.5 rounded-xl bg-navy-900/80 hover:bg-navy-800 text-gold-300 font-semibold text-sm tracking-wide border border-gold-500/40 hover:border-gold-400 backdrop-blur-md transform hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-luxury"
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Plan My Stay with AI</span>
          </Link>
        </motion.div>

        {/* Hero Search Bar Component */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 sm:mt-16 max-w-5xl mx-auto"
        >
          <SearchBar variant="hero" />
        </motion.div>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-ivory-300/80"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Safe Direct Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            <span>No Hidden Surcharges</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            <span>Pay Upon Arrival at Hotel</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Powered by Google Gemini</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
