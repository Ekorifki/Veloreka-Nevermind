import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell } from 'lucide-react';
import ProductCard, { staggerContainerVariants } from './ProductCard';

export default function SavedItemsScreen({
  savedProducts,
  savedIds,
  onToggleSave,
  onClearAllSaved,
  onRestoreDemoSaved,
  onSelectProduct,
  onAddToCart,
  onBack,
}) {
  return (
    <div className="flex-1 w-full bg-white flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="px-6 pt-5 pb-3.5 flex items-center justify-between border-b border-neutral-100">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <h1 className="text-[22px] font-bold text-[#8B2313] tracking-tight">
          Saved Items
        </h1>
        <button
          type="button"
          aria-label="Notifications"
          className="w-9 h-9 -mr-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-all duration-200 active:scale-95"
        >
          <Bell className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
        {savedProducts.length > 0 ? (
          <div>
            {/* Subtle state action bar */}
            <div className="flex items-center justify-between mb-3.5 text-xs text-[#808080]">
              <span>
                <strong className="text-[#8B2313]">
                  {savedProducts.length}
                </strong>{' '}
                {savedProducts.length === 1 ? 'item' : 'items'} saved
              </span>
              {onClearAllSaved && (
                <button
                  type="button"
                  onClick={onClearAllSaved}
                  className="text-[#8B2313] font-medium underline hover:opacity-80 transition-all duration-200 active:scale-95"
                >
                  Clear all (Preview Empty)
                </button>
              )}
            </div>

            {/* 2-Column Staggered Product Grid matching Saved Items.jpg */}
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-4 pb-4"
            >
              {savedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSaved={savedIds.includes(product.id)}
                  onToggleSave={onToggleSave}
                  onSelect={onSelectProduct}
                  onAddToCart={onAddToCart}
                  showAddToCartPill={false}
                />
              ))}
            </motion.div>
          </div>
        ) : (
          /* Empty State matching Saved Items- Empty.jpg */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.24 }}
            className="h-full min-h-[420px] flex flex-col items-center justify-center text-center px-4"
          >
            <svg
              width="68"
              height="62"
              viewBox="0 0 68 62"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-5"
            >
              <path
                d="M34 57.5C34 57.5 6.5 41.2 6.5 20.5C6.5 11.4 13.7 4.5 22.3 4.5C27.5 4.5 32.1 7.1 34 11.2C35.9 7.1 40.5 4.5 45.7 4.5C54.3 4.5 61.5 11.4 61.5 20.5C61.5 41.2 34 57.5 34 57.5Z"
                fill="#EDEDED"
                stroke="#B3B3B3"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-[20px] font-bold text-[#B84A49]">
              No Saved Items!
            </h2>
            <p className="text-[15px] text-[#808080] mt-2.5 max-w-[265px] leading-relaxed">
              You don&apos;t have any saved items. Go to home and add some.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl bg-[#8B2313] hover:bg-[#721C0F] text-white text-xs font-semibold transition-all duration-200 active:scale-95 shadow-sm"
              >
                Go to Home
              </button>
              {onRestoreDemoSaved && (
                <button
                  type="button"
                  onClick={onRestoreDemoSaved}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-[#808080] text-xs font-medium transition-all duration-200 active:scale-95"
                >
                  Restore Demo Items
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
