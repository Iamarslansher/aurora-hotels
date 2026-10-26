import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Info,
  Sliders,
  Bed,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { generateAiBudgetPlan } from '../services/geminiService';
import { formatPKR } from '../utils/formatters';
import { getTodayString, getTomorrowString, addDays } from '../utils/dateUtils';
import { BookingModal } from '../components/booking/BookingModal';

export const AiPlannerPage = () => {
  const [urlParams] = useSearchParams();
  const { rooms, services } = useHotel();

  // Inputs
  const [budget, setBudget] = useState(
    Number(urlParams.get('budget')) || 8500
  );
  const [guests, setGuests] = useState(
    Number(urlParams.get('guests')) || 2
  );
  const [roomTypePreference, setRoomTypePreference] = useState('Any');
  const [checkIn, setCheckIn] = useState(getTodayString());
  const [checkOut, setCheckOut] = useState(getTomorrowString());
  const [selectedServices, setSelectedServices] = useState([
    'srv-breakfast',
    'srv-tea',
  ]);
  const [userPrompt, setUserPrompt] = useState(
    'I have Rs. 8,500 for two people. Suggest the best available couple room with breakfast if possible.'
  );

  // Results
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [bookingModalRoom, setBookingModalRoom] = useState(null);

  // Quick preset buttons
  const quickPresets = [
    { label: 'Solo Budget (Rs. 5,000)', budget: 5000, guests: 1, prompt: 'I have Rs. 5,000 for solo travel. Recommend an executive room with breakfast.' },
    { label: 'Couple Retreat (Rs. 9,500)', budget: 9500, guests: 2, prompt: 'I have Rs. 9,500 for two people. Suggest the best couple suite with breakfast and Kashmiri tea.' },
    { label: 'Friends Villa (Rs. 18,000)', budget: 18000, guests: 5, prompt: 'I have Rs. 18,000 for 5 friends. Suggest a spacious villa with extra cashmere blankets and water.' },
  ];

  const handleApplyPreset = (preset) => {
    setBudget(preset.budget);
    setGuests(preset.guests);
    setUserPrompt(preset.prompt);
  };

  const toggleServicePref = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleGeneratePlan = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setPlanResult(null);

    try {
      const plan = await generateAiBudgetPlan({
        budget: Number(budget),
        guests: Number(guests),
        checkIn,
        checkOut,
        roomTypePreference,
        servicePreferences: selectedServices,
        availableRooms: rooms,
        availableServices: services,
        userNotes: userPrompt,
      });

      setPlanResult(plan);
    } catch (err) {
      console.error('AI plan generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-20 text-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-600/30 text-gold-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-600 animate-spin" />
            <span>Google Gemini AI Stay Engine</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight">
            AI Budget Planner
          </h1>
          <p className="mt-3 text-navy-700 text-sm sm:text-base leading-relaxed">
            State your total budget in Pakistani Rupees. Gemini cross-references verified room rates
            and configured hospitality services to formulate an optimal itinerary with 100% price accuracy.
          </p>

          {/* Development Notice as required by prompt */}
          <div className="mt-4 p-3 rounded-xl bg-navy-900/5 border border-navy-900/10 text-xs text-navy-600 max-w-2xl mx-auto flex items-center justify-center gap-2">
            <Info className="w-4 h-4 text-gold-600 shrink-0" />
            <span>
              Architecture Notice: Direct Gemini API key demo (`VITE_GEMINI_API_KEY`). For production,
              use a Firebase Cloud Function proxy to safeguard credentials.
            </span>
          </div>
        </div>

        {/* Two Column Layout: Form & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Form */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gold-500/20 shadow-luxury space-y-6">
            <h2 className="font-serif text-xl font-bold text-navy-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-gold-600" />
              Stay &amp; Budget Parameters
            </h2>

            {/* Quick Presets */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-navy-600 block mb-2">
                Quick Scenarios:
              </label>
              <div className="space-y-1.5">
                {quickPresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="w-full text-left p-2.5 rounded-xl border border-navy-100 bg-ivory hover:border-gold-400 text-xs text-navy-900 font-medium transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              {/* Budget in PKR */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Budget in PKR *
                  </label>
                  <span className="font-serif font-bold text-base text-gold-700">
                    {formatPKR(budget)}
                  </span>
                </div>
                <input
                  type="number"
                  min={3000}
                  max={100000}
                  step={500}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-bold text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
                <input
                  type="range"
                  min={4000}
                  max={50000}
                  step={500}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-gold-600 cursor-pointer"
                />
              </div>

              {/* Guest Count & Room Preference */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Guests (1-5) *
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  >
                    <option value={1}>1 Guest (Single Room)</option>
                    <option value={2}>2 Guests (Couple Room)</option>
                    <option value={3}>3 Guests (Friends Suite)</option>
                    <option value={4}>4 Guests (Friends Suite)</option>
                    <option value={5}>5 Guests (Friends Villa)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Preferred Room
                  </label>
                  <select
                    value={roomTypePreference}
                    onChange={(e) => setRoomTypePreference(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  >
                    <option value="Any">Best Fit for Group</option>
                    <option value="Single Room">Single Room</option>
                    <option value="Couple Room">Couple Room</option>
                    <option value="Friends Room">Friends Room</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Check-In
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
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Check-Out
                  </label>
                  <input
                    type="date"
                    min={addDays(checkIn, 1)}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Extra Services Checklist */}
              <div className="pt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700 block mb-2">
                  Requested Amenities &amp; Enhancements:
                </label>
                <div className="space-y-2">
                  {services.map((srv) => (
                    <label
                      key={srv.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-ivory text-xs text-navy-900 font-medium cursor-pointer hover:bg-gold-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(srv.id)}
                        onChange={() => toggleServicePref(srv.id)}
                        className="rounded text-gold-600 focus:ring-gold-500"
                      />
                      <span className="flex-1">{srv.name}</span>
                      <span className="text-gold-700 font-bold">{formatPKR(srv.price)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Natural Language Prompt */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Custom Guest Note / Prompt
                </label>
                <textarea
                  rows={2}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-xs text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gold-gradient hover:opacity-95 text-navy-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-navy-950" />
                <span>{loading ? 'Consulting Gemini AI...' : 'Generate AI Stay Plan'}</span>
              </button>
            </form>
          </div>

          {/* Right AI Results Panel */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="bg-navy-950 text-ivory rounded-3xl p-10 border border-gold-500/30 shadow-luxury-lg text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-gold-500/20 border-2 border-gold-400 flex items-center justify-center mx-auto animate-pulse">
                  <Bot className="w-8 h-8 text-gold-400 animate-spin" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-ivory">
                  Crafting Your Bespoke Stay
                </h3>
                <p className="text-sm text-ivory-300 max-w-md mx-auto">
                  Google Gemini is analyzing room capacities, dates, and service rates to build
                  a balanced itinerary within your PKR {formatPKR(budget)} budget.
                </p>
              </div>
            ) : planResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-navy-950 text-ivory rounded-3xl p-6 sm:p-8 border border-gold-500/30 shadow-luxury-lg space-y-6"
              >
                {/* Header Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-navy-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-gold-400" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-ivory">
                        Tailored Stay Recommendation
                      </h3>
                      <p className="text-xs text-gold-400">
                        {planResult.isLiveAi ? '✓ Powered by Live Google Gemini API' : '✓ Verified Aurora Concierge Engine'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      planResult.isWithinBudget
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : 'bg-gold-950 text-gold-400 border border-gold-500/40'
                    }`}
                  >
                    {planResult.isWithinBudget ? 'Within Budget' : 'Alternative Suggestion'}
                  </span>
                </div>

                {/* AI Narrative */}
                <div className="prose prose-invert prose-sm max-w-none text-ivory-200 leading-relaxed bg-navy-900/60 p-5 rounded-2xl border border-gold-500/20 whitespace-pre-line font-sans text-xs sm:text-sm">
                  {planResult.aiNarrative}
                </div>

                {/* Itemized Math Card (Preventing Hallucination) */}
                <div className="p-5 rounded-2xl bg-navy-900 border border-gold-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-base text-gold-300">
                      Itemized Math &amp; Snapshot
                    </h4>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Deterministic
                    </span>
                  </div>

                  <div className="flex justify-between text-xs sm:text-sm text-ivory-300">
                    <span>
                      {planResult.selectedRoom.name} ({planResult.nights} night{planResult.nights > 1 ? 's' : ''} × {formatPKR(planResult.selectedRoom.pricePerNight)})
                    </span>
                    <span className="font-bold text-ivory">
                      {formatPKR(planResult.roomTotal)}
                    </span>
                  </div>

                  {planResult.selectedServices.map((s, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-ivory-400 pl-3 border-l border-gold-400/40">
                      <span>+ {s.service.name}</span>
                      <span className="font-medium text-ivory-300">{formatPKR(s.cost)}</span>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-navy-800 flex justify-between items-center text-sm font-bold">
                    <div>
                      <span className="text-ivory block">Calculated Grand Total</span>
                      <span className="text-[11px] font-normal text-ivory-400">
                        Target Budget: {formatPKR(planResult.targetBudget)}
                      </span>
                    </div>
                    <span className="font-serif text-2xl text-gold-300">
                      {formatPKR(planResult.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Confirm Booking CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalRoom(planResult.selectedRoom)}
                    className="w-full py-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 hover:opacity-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-navy-950" />
                    <span>Review &amp; Lock In This Guaranteed Plan</span>
                    <ArrowRight className="w-4 h-4 text-navy-950" />
                  </button>
                  <p className="text-[11px] text-center text-ivory-400 mt-2">
                    Review and confirm explicitly • Payment upon arrival at hotel
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl p-10 border border-gold-500/20 shadow-luxury text-center space-y-4">
                <Bot className="w-12 h-12 text-gold-600 mx-auto" />
                <h3 className="font-serif text-2xl font-bold text-navy-900">
                  Ready to Curate Your Stay
                </h3>
                <p className="text-sm text-navy-700 max-w-md mx-auto leading-relaxed">
                  Enter your PKR budget on the left and click <strong>"Generate AI Stay Plan"</strong>.
                  Gemini will recommend the highest-rated room category and matching extra services.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {bookingModalRoom && (
        <BookingModal
          room={bookingModalRoom}
          isOpen={Boolean(bookingModalRoom)}
          onClose={() => setBookingModalRoom(null)}
          initialServices={planResult?.selectedServices || []}
        />
      )}
    </div>
  );
};
