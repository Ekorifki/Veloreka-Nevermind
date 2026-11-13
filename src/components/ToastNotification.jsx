import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Heart, CheckCircle2, X } from 'lucide-react';

export default function ToastNotification({ toast, onDismiss }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-11 left-4 right-4 z-50 pointer-events-auto"
        >
          <div className="w-full rounded-2xl bg-[#1A1A1A]/95 backdrop-blur-md text-white px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.28)] border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {toast.image ? (
                <img
                  src={toast.image}
                  alt=""
                  className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-white/15"
                />
              ) : (
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    toast.type === 'wishlist'
                      ? 'bg-[#8B2313] text-white'
                      : toast.type === 'cart'
                      ? 'bg-[#0C9409] text-white'
                      : 'bg-white/15 text-white'
                  }`}
                >
                  {toast.type === 'wishlist' ? (
                    <Heart className="w-4 h-4 fill-current" />
                  ) : toast.type === 'cart' ? (
                    <ShoppingBag className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-[13px] font-bold text-white leading-tight truncate">
                  {toast.title}
                </p>
                {toast.subtitle && (
                  <p className="text-[11.5px] text-neutral-300 leading-tight truncate mt-0.5">
                    {toast.subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={onDismiss}
              className="text-neutral-400 hover:text-white p-1 rounded-lg transition-all duration-200 active:scale-95 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
