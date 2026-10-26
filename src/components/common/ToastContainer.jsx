import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useHotel();

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto p-4 rounded-xl shadow-luxury-lg border flex items-start gap-3 backdrop-blur-md ${
                isError
                  ? 'bg-red-950/90 border-red-500/40 text-red-100'
                  : isSuccess
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
                  : 'bg-navy-900/90 border-gold-500/40 text-ivory-100'
              }`}
            >
              {isError && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {!isError && !isSuccess && <Info className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />}

              <div className="flex-1 text-sm font-medium">
                {toast.title && <div className="font-serif font-bold mb-0.5">{toast.title}</div>}
                <div>{toast.message}</div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-ivory-300 hover:text-white transition-colors p-1"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
