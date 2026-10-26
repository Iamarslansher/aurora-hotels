import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Check, DollarSign, Bot, ShieldCheck } from 'lucide-react';
import { formatPKR } from '../../utils/formatters';

export const AiPlannerTeaser = () => {
  const [sampleBudget, setSampleBudget] = useState(8500);
  const [sampleGuests, setSampleGuests] = useState(2);

  const presets = [
    { label: 'Solo Traveler (Rs. 5,000)', budget: 5000, guests: 1 },
    { label: 'Couple Retreat (Rs. 8,500)', budget: 8500, guests: 2 },
    { label: 'Friends Villa (Rs. 18,000)', budget: 18000, guests: 5 },
  ];

  return (
    <section className="py-20 lg:py-28 bg-ivory text-navy-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/15 border border-gold-600/30 text-gold-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold-600 animate-spin" />
              <span>Smart Hospitality Intelligence</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight leading-tight">
              Let Google Gemini Plan Your Stay Within Your Budget.
            </h2>

            <p className="text-navy-700 text-sm sm:text-base leading-relaxed">
              No guesswork or rigid booking packages. Share your PKR budget, group size, and preferred room style.
              Our Gemini AI Concierge cross-references verified live room availability and configured services
              to engineer your bespoke itinerary with 100% accurate mathematical pricing.
            </p>

            {/* Benefit bullets */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm text-navy-800">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <span><strong>Zero Price Hallucinations:</strong> Calculations are computed directly from verified room and service rates.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-navy-800">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <span><strong>No Automatic Charges:</strong> You always review and explicitly confirm your reservation.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-navy-800">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <span><strong>Strict Privacy:</strong> Personal CNICs and passwords are never transmitted to Gemini.</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/ai-planner"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-ivory font-bold text-sm tracking-wide shadow-luxury transform hover:-translate-y-0.5 transition-all"
              >
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>Launch Full AI Budget Planner</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </Link>
            </div>
          </div>

          {/* Right Interactive Mockup Card */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-navy-950 text-ivory rounded-3xl p-6 sm:p-8 border border-gold-500/30 shadow-luxury-lg relative"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-6 border-b border-navy-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-ivory">Gemini Stay Concierge</h3>
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Verified Catalog
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-navy-800 text-gold-400 border border-gold-500/30">
                  Interactive Demo
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="mt-5">
                <label className="text-xs uppercase tracking-wider text-ivory-300 font-semibold block mb-2">
                  Test Sample Budgets:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSampleBudget(p.budget);
                        setSampleGuests(p.guests);
                      }}
                      className={`text-xs p-2 rounded-lg font-medium border text-left transition-all ${
                        sampleBudget === p.budget
                          ? 'bg-gold-500/20 border-gold-400 text-gold-300'
                          : 'bg-navy-900 border-navy-800 text-ivory-300 hover:border-gold-500/30'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Response Preview Box */}
              <div className="mt-6 p-4 rounded-xl bg-navy-900/90 border border-gold-500/20 text-xs sm:text-sm space-y-3 font-mono text-ivory-200">
                <div className="text-gold-400 font-sans font-bold flex items-center justify-between">
                  <span>Guest Request:</span>
                  <span className="text-xs bg-navy-800 px-2 py-0.5 rounded text-ivory">
                    {formatPKR(sampleBudget)} PKR • {sampleGuests} Guest{sampleGuests > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs font-sans text-ivory-300 leading-relaxed italic">
                  "{sampleBudget <= 6000
                    ? 'I have Rs. 5,000 for solo travel. Recommend an executive room with high-speed Wi-Fi and breakfast.'
                    : sampleBudget <= 10000
                    ? 'I have Rs. 8,500 for two people. Suggest the best couple suite with evening Kashmiri tea.'
                    : 'I have Rs. 18,000 for 5 friends. Suggest a spacious villa with extra cashmere blankets.'}"
                </p>

                <div className="pt-2 border-t border-navy-800 text-xs font-sans space-y-1.5">
                  <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Gemini Recommendation:</span>
                  </div>
                  <p className="text-ivory-200">
                    {sampleBudget <= 6000
                      ? 'Executive Solo Haven (Rs. 4,500) + Extra Goose Down Pillow Set (Rs. 400). Total: Rs. 4,900 PKR.'
                      : sampleBudget <= 10000
                      ? 'Royal Champagne Couple Suite (Rs. 8,500) + Soaking Bathtub & Terrace. Perfectly within budget.'
                      : 'Grand Aurora Friends Villa Suite (Rs. 16,500) + Extra Cashmere Blankets (Rs. 1,200). Total: Rs. 17,700 PKR.'}
                  </p>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="mt-6">
                <Link
                  to={`/ai-planner?budget=${sampleBudget}&guests=${sampleGuests}`}
                  className="w-full py-3 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-gold-glow"
                >
                  <Sparkles className="w-4 h-4 text-navy-950" />
                  <span>Customize in Live AI Planner</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
