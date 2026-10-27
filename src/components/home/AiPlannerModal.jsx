import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, CheckCircle2, LoaderCircle, Sparkles, X } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { generateAiBudgetPlan } from '../../services/geminiService';
import { formatPKR } from '../../utils/formatters';

const cleanNarrative = (text) =>
  text
    .replace(/^#{1,6}[ \t]+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/^[ \t]*[-*][ \t]+/gm, '• ');

export const AiPlannerModal = ({ isOpen, onClose }) => {
  const { rooms, services, searchParams, addToast } = useHotel();
  const [budget, setBudget] = useState(8500);
  const [guests, setGuests] = useState(2);
  const [selectedServices, setSelectedServices] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleService = (serviceId) => {
    setSelectedServices((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setPlan(null);

    try {
      const result = await generateAiBudgetPlan({
        budget: Number(budget),
        guests: Number(guests),
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        roomTypePreference: 'Any',
        servicePreferences: selectedServices,
        availableRooms: rooms,
        availableServices: services,
      });

      if (!result.success) {
        addToast({
          type: 'error',
          title: 'No Suitable Stay Found',
          message: result.message,
        });
        return;
      }

      setPlan(result);
      addToast({
        type: 'success',
        title: 'Stay Plan Ready',
        message: 'Your personalized room and pricing breakdown is ready.',
      });
    } catch (error) {
      console.error('AI planner request failed:', error);
      addToast({
        type: 'error',
        title: 'Planner Error',
        message: 'We could not prepare a stay plan. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-navy-950/80 p-3 backdrop-blur-md sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-planner-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-gold-500/30 bg-white shadow-luxury-lg"
          >
            <div className="flex items-start justify-between border-b border-gold-500/20 bg-navy-950 p-5 text-ivory sm:p-7">
              <div>
                <span className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400">
                  <Sparkles className="h-4 w-4" /> Aurora AI Concierge
                </span>
                <h2 id="ai-planner-title" className="font-serif text-2xl font-bold sm:text-3xl">
                  Plan Your Stay
                </h2>
                <p className="mt-1 text-xs text-ivory-300">
                  Room rates and service costs are calculated from the live catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close AI planner"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-navy-900 text-ivory transition-colors hover:text-gold-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.9fr_1.1fr]">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1.5 text-xs font-semibold text-navy-700">
                    Budget (PKR)
                    <input
                      type="number"
                      min="1"
                      required
                      value={budget}
                      onChange={(event) => setBudget(event.target.value)}
                      className="w-full rounded-xl border border-navy-200 bg-ivory px-3 py-2.5 text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs font-semibold text-navy-700">
                    Guests
                    <select
                      value={guests}
                      onChange={(event) => setGuests(Number(event.target.value))}
                      className="w-full rounded-xl border border-navy-200 bg-ivory px-3 py-2.5 text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      {[1, 2, 3, 4, 5].map((count) => (
                        <option key={count} value={count}>
                          {count} Guest{count > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-xs font-semibold text-navy-700">
                    Desired Extra Services
                  </legend>
                  {services.filter((service) => service.isActive !== false).map((service) => (
                    <label
                      key={service.id}
                      className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-navy-100 p-3 text-xs text-navy-800 transition-colors hover:border-gold-400"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="mt-0.5 accent-amber-600"
                      />
                      <span>
                        <span className="block font-semibold">{service.name}</span>
                        <span className="mt-0.5 block text-navy-500">
                          {service.description} · {formatPKR(service.price)}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>

                <button
                  type="submit"
                  disabled={loading || rooms.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-gradient px-5 py-3 text-xs font-bold uppercase tracking-wider text-navy-950 shadow-gold-glow transition-opacity hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {loading ? 'Building Your Plan...' : 'Generate Stay Plan'}
                </button>
                {rooms.length === 0 && (
                  <p className="text-xs text-amber-700">Room rates are not available right now.</p>
                )}
              </form>

              <section className="min-h-64 rounded-2xl border border-gold-500/20 bg-navy-950 p-5 text-ivory sm:p-6">
                {!plan ? (
                  <div className="flex h-full min-h-56 flex-col items-center justify-center text-center">
                    <Bot className="mb-3 h-10 w-10 text-gold-400" />
                    <h3 className="font-serif text-xl font-bold">Your itinerary will appear here</h3>
                    <p className="mt-2 max-w-xs text-xs leading-relaxed text-ivory-300">
                      Choose a budget, guest count, and any extras to receive a tailored recommendation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gold-300">
                      <CheckCircle2 className="h-5 w-5" />
                      <h3 className="font-serif text-xl font-bold">Your Stay Itinerary</h3>
                    </div>
                    <div className="whitespace-pre-line text-xs leading-relaxed text-ivory-200">
                      {cleanNarrative(plan.aiNarrative)}
                    </div>
                    <div className="space-y-2 border-t border-navy-700 pt-4 text-xs">
                      <div className="flex justify-between gap-3">
                        <span>{plan.selectedRoom.name} · {plan.nights} night{plan.nights > 1 ? 's' : ''}</span>
                        <span>{formatPKR(plan.roomTotal)}</span>
                      </div>
                      {plan.selectedServices.map((item) => (
                        <div key={item.service.id} className="flex justify-between gap-3 text-ivory-300">
                          <span>{item.service.name}</span>
                          <span>{formatPKR(item.cost)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-navy-700 pt-2 font-bold text-gold-300">
                        <span>Estimated Total</span>
                        <span>{formatPKR(plan.grandTotal)}</span>
                      </div>
                      <p className={plan.isWithinBudget ? 'text-emerald-300' : 'text-amber-300'}>
                        {plan.isWithinBudget
                          ? `Within budget · ${formatPKR(plan.difference)} remaining`
                          : `${formatPKR(plan.difference)} above your budget`}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
