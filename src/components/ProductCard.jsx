import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export function formatPrice(price) {
  if (price >= 100) {
    return `$${price.toLocaleString('en-US')}`;
  }
  return `$${price.toFixed(2)}`;
}

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.02,
    },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.26,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function ProductCard({
  product,
  isSaved = false,
  onToggleSave,
  onSelect,
  onAddToCart,
  showAddToCartPill = true,
}) {
  return (
    <motion.div
      variants={staggerItemVariants}
      whileHover={{ y: -2 }}
      onClick={() => onSelect?.(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) =>
        (e.key === 'Enter' || e.key === ' ') && onSelect?.(product)
      }
      className="group flex flex-col cursor-pointer text-left select-none transition-all duration-200 active:scale-[0.98]"
    >
      {/* Image Container */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-100 aspect-[1/1.05] mb-3 shadow-sm">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
        />

        {/* Bookmark / Love Button with tactile active:scale-95 micro-interaction */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          aria-label={
            isSaved
              ? `Remove ${product.name} from saved items`
              : `Save ${product.name}`
          }
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(product.id);
          }}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-200 active:scale-95 hover:bg-neutral-50 z-10"
        >
          <Heart
            className={`w-[18px] h-[18px] transition-all duration-200 ${
              isSaved
                ? 'fill-[#8B2313] text-[#8B2313] scale-110'
                : 'text-[#808080] hover:text-[#8B2313]'
            }`}
          />
        </motion.button>

        {/* Add To Cart Pill Button */}
        {showAddToCartPill && onAddToCart && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product, 'M');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#222222]/95 hover:bg-black text-white text-[11.5px] font-medium whitespace-nowrap shadow-md transition-all duration-200 active:scale-95"
            >
              Add To Cart
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-medium text-[#808080] uppercase tracking-wider">
          {product.category}
        </span>
      </div>
      <h3 className="text-[14px] font-semibold text-[#8B2313] truncate mt-0.5 group-hover:underline">
        {product.name}
      </h3>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[15px] font-bold text-[#1A1A1A]">
          {formatPrice(product.price)}
        </span>
        {product.oldPrice && (
          <span className="text-[12px] text-[#999999] line-through">
            {formatPrice(product.oldPrice)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
