import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, HeartHandshake, Award, Coffee, Lock } from 'lucide-react';

export const AboutSection = () => {
  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Zero Double Bookings',
      desc: 'Our Firestore concurrency engine validates reservation dates across transactions to ensure 100% room availability.',
    },
    {
      icon: Sparkles,
      title: 'AI Smart Budgeting',
      desc: 'Tailor your room and dining package with Google Gemini based on your exact budget in Pakistani Rupees.',
    },
    {
      icon: HeartHandshake,
      title: 'Authentic Hospitality',
      desc: 'Experience curated afternoon Kashmiri chai, custom pillow menus, and 24/7 dedicated concierge assistance.',
    },
    {
      icon: Lock,
      title: 'Strict Guest Privacy',
      desc: 'Your CNIC and personal records are encrypted, masked in general views, and never transmitted to external AI.',
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-white text-navy-950 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Images Grid */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-luxury-lg border-2 border-gold-500/20">
              <img
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
                alt="Aurora Hotel Architecture"
                className="w-full h-[440px] sm:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs uppercase tracking-widest text-gold-300 font-bold block mb-1">
                  Est. 2024
                </span>
                <p className="font-serif text-xl sm:text-2xl font-bold">
                  Bespoke Architectural Serenity
                </p>
              </div>
            </div>

            {/* Overlapping Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden sm:flex absolute -bottom-8 -right-6 z-20 bg-navy-950 text-ivory p-5 rounded-2xl border border-gold-500/40 shadow-luxury-lg items-center gap-4 max-w-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-navy-950" />
              </div>
              <div>
                <p className="text-xs text-gold-400 font-bold uppercase tracking-wider">Heritage &amp; Grace</p>
                <p className="text-sm font-semibold text-ivory">5-Star Luxury Rating across Pakistan</p>
              </div>
            </motion.div>
          </div>

          {/* About Story & Benefits */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold block mb-2">
                About Aurora
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight leading-tight">
                Where Timeless Elegance Meets Intelligent Comfort.
              </h2>
            </div>

            <p className="text-navy-700 text-sm sm:text-base leading-relaxed">
              Nestled at the crossroads of tranquil scenic beauty and urban sophistication,
              <strong> Aurora Hotels &amp; Bookings</strong> was founded to harmonize authentic South Asian warmth
              with progressive modern convenience.
            </p>

            <p className="text-navy-700 text-sm sm:text-base leading-relaxed">
              Every detail—from hand-selected Egyptian cotton linens and cashmere throws to our pioneering
              AI Budget Planner—is curated to ensure that every guest, whether traveling solo, celebrating with
              a partner, or gathering with lifelong friends, discovers their personal sanctuary.
            </p>

            {/* 4 Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {benefits.map((b, idx) => {
                const Icon = b.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-ivory border border-gold-500/20 space-y-1.5 hover:border-gold-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-navy-900 font-bold text-sm">
                      <Icon className="w-4 h-4 text-gold-600 shrink-0" />
                      <span>{b.title}</span>
                    </div>
                    <p className="text-xs text-navy-700/80 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
