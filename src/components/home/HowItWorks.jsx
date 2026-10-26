import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, SlidersHorizontal, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Select or AI-Plan',
      description:
        'Browse our Single, Couple, or Friends categories, or simply state your PKR budget to Google Gemini for a personalized package.',
      icon: Sparkles,
      iconColor: 'text-gold-400',
    },
    {
      number: '02',
      title: 'Customize Your Comfort',
      description:
        'Tailor your stay with artisan breakfast buffet, Kashmiri chai high tea, extra cashmere blankets, or VIP airport chauffeurs.',
      icon: SlidersHorizontal,
      iconColor: 'text-emerald-400',
    },
    {
      number: '03',
      title: 'Guaranteed Safe Reservation',
      description:
        'Receive instant confirmation with a locked price snapshot. Concurrency transactions ensure zero double bookings, with payment upon arrival.',
      icon: ShieldCheck,
      iconColor: 'text-gold-400',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-navy-950 text-ivory relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-bold block mb-2">
            The Aurora Experience
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ivory tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 text-ivory-300 text-sm sm:text-base leading-relaxed">
            From smart budget curation to seamless check-in, your peaceful stay is guaranteed every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-navy-900/80 border border-gold-500/20 p-8 rounded-2xl relative shadow-luxury-lg backdrop-blur-sm flex flex-col justify-between group hover:border-gold-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-navy-800 border border-gold-500/30 flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${step.iconColor}`} />
                    </div>
                    <span className="font-serif text-3xl font-extrabold text-gold-500/30 group-hover:text-gold-500/60 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-ivory mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ivory-300/80 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-navy-800/80 flex items-center text-xs font-semibold text-gold-400">
                  <span>Seamless &amp; Transparent</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
