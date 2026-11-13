import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Bell, Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { ProductDetailsSkeleton } from './Skeletons';

export default function ProductDetails({
  product,
  isSaved = false,
  onToggleSave,
  onAddToCart,
  onBack,
}) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  useEffect(() => {
    setActiveImageIdx(0);
    setSelectedSize('M');
    setIsLoadingDetails(true);
    const timer = setTimeout(() => {
      setIsLoadingDetails(false);
    }, 260);
    return () => clearTimeout(timer);
  }, [product?.id]);

  if (!product) return null;

  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const sizes = product.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL'];

  const formattedDetailPrice =
    product.price >= 100
      ? `$ ${product.price.toLocaleString('en-US')}`
      : `$ ${product.price.toFixed(2)}`;

  const handleAdd = () => {
    onAddToCart?.(product, selectedSize);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1400);
  };

  return (
    <div className="flex-1 w-full bg-white flex flex-col justify-between overflow-hidden">
      {/* Scrollable Upper Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-all duration-200 active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-[22px] font-bold text-[#8B2313] tracking-tight">
            Details
          </h1>
          <button
            type="button"
            aria-label="Notifications"
            className="w-9 h-9 -mr-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-all duration-200 active:scale-95"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {isLoadingDetails ? (
          <ProductDetailsSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Product Image Gallery Showcase */}
            <div className="px-6 pt-2">
              <div className="relative w-full h-[290px] rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={gallery[activeImageIdx]}
                    src={gallery[activeImageIdx]}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="w-full h-full object-contain"
                  />
                </AnimatePresence>

                {/* Floating Heart / Save Button */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  aria-label={isSaved ? 'Remove from Saved' : 'Save item'}
                  onClick={() => onToggleSave?.(product.id)}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-sm border border-neutral-100 flex items-center justify-center transition-all duration-200 active:scale-95"
                >
                  <Heart
                    className={`w-6 h-6 transition-all duration-200 ${
                      isSaved
                        ? 'fill-[#8B2313] text-[#8B2313] scale-110'
                        : 'text-[#999999] hover:text-[#8B2313]'
                    }`}
                  />
                </motion.button>
              </div>

              {/* Thumbnail Strip */}
              {gallery.length > 1 && (
                <div className="flex items-center justify-center gap-2.5 mt-2">
                  {gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 active:scale-95 p-0.5 bg-neutral-50 ${
                        activeImageIdx === idx
                          ? 'border-[#8B2313] scale-105 shadow-sm'
                          : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="px-6 pt-5 pb-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FDF1E8] text-[#8B2313]">
                  {product.category}
                </span>
                <span className="text-xs text-[#808080] font-medium">
                  {product.name}
                </span>
              </div>

              <h2 className="text-[24px] font-bold text-[#8B2313] tracking-tight mt-1.5">
                {product.fitTitle || product.name}
              </h2>

              {/* Rating Row */}
              <div className="flex items-center gap-1.5 mt-2">
                <Star className="w-5 h-5 fill-[#FFA928] text-[#FFA928]" />
                <span className="text-[15px] font-semibold text-[#8B2313] underline underline-offset-2">
                  {product.rating.toFixed(1)}/5
                </span>
                <span className="text-[15px] text-[#808080]">
                  ({product.reviewsCount || 45} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-[15px] text-[#808080] leading-[1.55] mt-3.5">
                {product.description}
              </p>

              {/* Size Selector (S, M, L, XL) */}
              <div className="mt-5">
                <h3 className="text-[19px] font-bold text-[#8B2313] mb-3">
                  Choose size
                </h3>
                <div className="flex items-center gap-3">
                  {sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`w-[52px] h-[48px] rounded-[12px] border text-[18px] font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#8B2313] bg-[#8B2313] text-white shadow-sm'
                            : 'border-[#E6E6E6] bg-white text-[#8B2313] hover:border-[#8B2313]/60'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Sticky Price + Add to Cart Bar */}
      <div className="w-full bg-white border-t border-neutral-200 px-6 py-3.5 flex items-center justify-between gap-5 flex-shrink-0">
        <div>
          <p className="text-[14px] text-[#808080] leading-tight">Price</p>
          <p className="text-[24px] font-bold text-[#8B2313] leading-tight mt-0.5 whitespace-nowrap">
            {formattedDetailPrice}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={`flex-1 h-[54px] rounded-[12px] font-medium text-[16px] text-white flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 shadow-md ${
            addedFeedback
              ? 'bg-[#0C9409]'
              : 'bg-[#8B2313] hover:bg-[#721C0F]'
          }`}
        >
          {addedFeedback ? (
            <>
              <Check className="w-5 h-5 stroke-[2.4]" />
              <span>Added ({selectedSize})</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
