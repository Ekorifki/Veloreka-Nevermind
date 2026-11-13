import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MapPin,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Bell,
  X,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { CATEGORIES, PROMO_BANNERS } from '../data/products';
import ProductCard, { staggerContainerVariants } from './ProductCard';
import { ProductGridSkeleton } from './Skeletons';

const bannerSlideVariants = {
  enter: (direction) => ({
    x: direction >= 0 ? '100%' : '-100%',
    opacity: 0.4,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction) => ({
    x: direction >= 0 ? '-100%' : '100%',
    opacity: 0.4,
    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function Home({
  user,
  products,
  savedIds,
  onToggleSave,
  onSelectProduct,
  onAddToCart,
  cartCount,
  unreadNotificationsCount = 0,
  onGoToNotifications,
  onGoToSearch,
  onGoToCart,
  onLogout,
}) {
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Home-1 (Notification modal) & Home-2 (Filters bottom sheet) states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);

  // Filter states (matching Home-2.png)
  const [sortBy, setSortBy] = useState('Relevance');
  const [maxPrice, setMaxPrice] = useState(1200);
  const [selectedSize, setSelectedSize] = useState('L');

  // Auto-Slide Logic (every 3.5 seconds) with cleanup on unmount
  useEffect(() => {
    if (isBannerPaused || PROMO_BANNERS.length <= 1) return undefined;

    const intervalId = setInterval(() => {
      setSlideDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % PROMO_BANNERS.length);
    }, 3500);

    return () => clearInterval(intervalId);
  }, [isBannerPaused, currentIndex]);

  const handleSelectBannerDot = (targetIdx) => {
    if (targetIdx === currentIndex) return;
    setSlideDirection(targetIdx > currentIndex ? 1 : -1);
    setCurrentIndex(targetIdx);
  };

  const handleCategoryChange = (category) => {
    if (category === activeCategory) return;
    setActiveCategory(category);
    setIsCategoryLoading(true);
    setTimeout(() => {
      setIsCategoryLoading(false);
    }, 240);
  };

  const handleApplyFilters = () => {
    setShowFiltersSheet(false);
    setIsCategoryLoading(true);
    setTimeout(() => {
      setIsCategoryLoading(false);
    }, 240);
  };

  // Filter & sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        activeCategory === 'All Categories' ||
        product.category === activeCategory ||
        product.subCategory === activeCategory;
      const matchesPrice = product.price <= maxPrice;
      const matchesSize =
        !selectedSize || product.sizes?.includes(selectedSize);
      return matchesCategory && matchesPrice && matchesSize;
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low - High') return a.price - b.price;
      if (sortBy === 'Price: High - Low') return b.price - a.price;
      return 0;
    });

  const activeBanner = PROMO_BANNERS[currentIndex] || PROMO_BANNERS[0];

  return (
    <div className="flex-1 w-full bg-white flex flex-col overflow-hidden relative">
      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-6">
        {/* Top Header: Location / Greeting & Action Buttons */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#8B2313] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[12px] text-[#808080] font-medium leading-tight">
                {user?.fullName ? `Hi, ${user.fullName} • Address` : 'Address'}
              </p>
              <p className="text-[14px] text-[#8B2313] font-semibold leading-tight mt-0.5">
                Indonesia, Purwokerto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Search products"
              onClick={onGoToSearch}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-all duration-200 active:scale-95"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Bell Icon -> Navigate to Notifications Screen */}
            <button
              type="button"
              aria-label="Open notifications"
              onClick={onGoToNotifications}
              title="Notifications"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 relative transition-all duration-200 active:scale-95"
            >
              <Bell className="w-5 h-5 stroke-[2.2]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#8B2313] text-white text-[10px] font-bold flex items-center justify-center leading-none ring-2 ring-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              aria-label="Cart"
              onClick={onGoToCart}
              className="w-10 h-10 rounded-full bg-[#FAF6F4] flex items-center justify-center text-[#8B2313] relative hover:bg-[#F3EAE5] transition-all duration-200 active:scale-95"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#8B2313] text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Input Bar & Home Variant Quick Toggles */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={onGoToSearch}
            className="flex-1 h-[44px] rounded-xl border border-[#E6E6E6] px-3.5 flex items-center gap-2.5 text-[#999999] hover:border-[#8B2313]/40 transition-all duration-200 active:scale-[0.99] bg-[#FAFAFA]"
          >
            <Search className="w-4 h-4 text-[#808080]" />
            <span className="text-[13.5px]">Search streetwear, Y2K...</span>
          </button>
          <button
            type="button"
            onClick={() => setShowNotificationModal(true)}
            title="Preview Home-1 Notification Permission Modal"
            className="h-[44px] px-3 rounded-xl border border-[#E6E6E6] bg-[#FAFAFA] hover:bg-neutral-100 text-[#8B2313] flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 active:scale-95"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden xs:inline">Home-1</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFiltersSheet(true)}
            title="Preview Home-2 Filters Sheet"
            className="h-[44px] px-3 rounded-xl border border-[#E6E6E6] bg-[#FAFAFA] hover:bg-neutral-100 text-[#8B2313] flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 active:scale-95"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden xs:inline">Home-2</span>
          </button>
        </div>

        {/* Logged-in User Bar */}
        {user?.email && (
          <div className="mb-3.5 px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs text-neutral-600">
            <span>
              Welcome,{' '}
              <strong className="text-[#1A1A1A]">
                {user.fullName || user.email}
              </strong>
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1 text-[#8B2313] font-semibold hover:underline transition-all duration-200 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Auto-Play Promo Banner Carousel with AnimatePresence */}
        <div
          className="relative mb-5"
          onMouseEnter={() => setIsBannerPaused(true)}
          onMouseLeave={() => setIsBannerPaused(false)}
          onTouchStart={() => setIsBannerPaused(true)}
          onTouchEnd={() => setIsBannerPaused(false)}
        >
          <div className="relative overflow-hidden rounded-2xl min-h-[168px] bg-[#FDF1E8]">
            <AnimatePresence
              initial={false}
              custom={slideDirection}
              mode="popLayout"
            >
              <motion.div
                key={activeBanner.id}
                custom={slideDirection}
                variants={bannerSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className={`w-full rounded-2xl ${activeBanner.bgClass} p-4 sm:p-5 flex items-center justify-between relative overflow-hidden min-h-[168px]`}
              >
                <div className="z-10 max-w-[57%]">
                  <h2 className="text-[23px] sm:text-[25px] font-extrabold text-[#8B2313] leading-tight tracking-tight">
                    {activeBanner.discount}
                  </h2>
                  <p className="text-[14px] font-medium text-[#8B2313] leading-snug mt-0.5">
                    {activeBanner.subtitle}
                  </p>
                  <p className="text-[11.5px] text-[#666666] font-medium mt-3">
                    Use Coupon: {activeBanner.coupon}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      handleCategoryChange(activeBanner.filterCategory)
                    }
                    className="mt-3 px-5 py-2 rounded-lg bg-[#8B2313] hover:bg-[#721C0F] text-white text-[12px] font-semibold transition-all duration-200 active:scale-95 shadow-sm"
                  >
                    {activeBanner.cta}
                  </button>
                </div>

                <img
                  src={activeBanner.image}
                  alt={activeBanner.subtitle}
                  className="w-[44%] max-h-[152px] object-contain self-end -mb-2 -mr-1 select-none pointer-events-none rounded-xl"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interactive Indicator Dots */}
          <div className="flex items-center justify-center gap-2 mt-2.5">
            {PROMO_BANNERS.map((banner, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={banner.id}
                  type="button"
                  aria-label={`Go to promo banner ${idx + 1}: ${banner.discount}`}
                  onClick={() => handleSelectBannerDot(idx)}
                  className={`h-2 rounded-full transition-all duration-300 active:scale-95 ${
                    isActive
                      ? 'w-6 bg-[#8B2313]'
                      : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-0.5">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`text-[13.5px] whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-[#8B2313] text-white font-semibold shadow-sm'
                    : 'bg-neutral-100 text-[#808080] font-medium hover:text-[#1A1A1A] hover:bg-neutral-200/70'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Active Filter Indicator if sorted or price-filtered */}
        {(sortBy !== 'Relevance' || maxPrice < 1200) && (
          <div className="flex items-center justify-between mb-3 px-3 py-1.5 rounded-lg bg-[#FDF1E8] text-xs text-[#8B2313]">
            <span>
              Filter: <strong>{sortBy}</strong> • Max{' '}
              <strong>${maxPrice}</strong> • Size{' '}
              <strong>{selectedSize}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setSortBy('Relevance');
                setMaxPrice(1200);
              }}
              className="underline font-semibold transition-all duration-200 active:scale-95"
            >
              Reset
            </button>
          </div>
        )}

        {/* Skeleton Loading or Staggered Product Grid */}
        {isCategoryLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <motion.div
            key={`${activeCategory}-${sortBy}-${maxPrice}`}
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-4 pb-2"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSaved={savedIds.includes(product.id)}
                onToggleSave={onToggleSave}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* HOME-1 VARIANT: iOS Notification Permission Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px] z-40 flex items-center justify-center px-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[300px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden text-center border border-neutral-200/80"
            >
              <div className="px-5 pt-5 pb-4">
                <h3 className="text-[17px] font-semibold text-black leading-snug">
                  &ldquo;App&rdquo; Would Like To Send You Notifications
                </h3>
                <p className="text-[13px] text-neutral-700 mt-1.5 leading-snug">
                  Notifications may include alerts, sounds, and icon badges.
                  These can be configured in Settings.
                </p>
              </div>
              <div className="grid grid-cols-2 border-t border-neutral-300/80 divide-x divide-neutral-300/80">
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="py-3 text-[17px] text-[#007AFF] font-normal hover:bg-neutral-100/80 active:scale-95 transition-all duration-200"
                >
                  Don&apos;t Allow
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="py-3 text-[17px] text-[#007AFF] font-semibold hover:bg-neutral-100/80 active:scale-95 transition-all duration-200"
                >
                  Allow
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HOME-2 VARIANT: Filters Bottom Sheet */}
      <AnimatePresence>
        {showFiltersSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 z-40 flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="w-full bg-white rounded-t-[28px] px-6 pt-3 pb-6 shadow-2xl"
            >
              {/* Drag Handle */}
              <div className="w-14 h-1.5 bg-neutral-200 rounded-full mx-auto mb-4" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <h3 className="text-[20px] font-bold text-[#8B2313]">
                  Filters
                </h3>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setShowFiltersSheet(false)}
                  className="text-[#8B2313] p-1 hover:bg-neutral-100 rounded-full transition-all duration-200 active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Sort By */}
              <div className="py-4 border-b border-neutral-200">
                <p className="text-[16px] font-bold text-[#8B2313] mb-3">
                  Sort By
                </p>
                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
                  {['Relevance', 'Price: Low - High', 'Price: High - Low'].map(
                    (option) => {
                      const active = sortBy === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSortBy(option)}
                          className={`px-4 py-2.5 rounded-xl text-[14px] font-medium whitespace-nowrap border transition-all duration-200 active:scale-95 ${
                            active
                              ? 'bg-[#8B2313] text-white border-[#8B2313]'
                              : 'bg-white text-[#999999] border-[#E6E6E6] hover:border-[#8B2313]/50'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="py-4 border-b border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[16px] font-bold text-[#8B2313]">
                    Price
                  </span>
                  <span className="text-[15px] text-[#808080] font-medium">
                    $ 0 - $ {maxPrice}
                  </span>
                </div>
                <input
                  type="range"
                  min="19"
                  max="1200"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#8B2313] cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
                />
              </div>

              {/* Size Selector */}
              <div className="py-4 flex items-center justify-between">
                <span className="text-[16px] font-bold text-[#8B2313]">
                  Size
                </span>
                <div className="flex items-center gap-2">
                  {['S', 'M', 'L', 'XL'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-all duration-200 active:scale-95 ${
                        selectedSize === sz
                          ? 'border-[#8B2313] bg-[#FDF1E8] text-[#8B2313]'
                          : 'border-neutral-200 text-[#808080]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                  <ChevronDown className="w-4 h-4 text-[#808080] ml-1" />
                </div>
              </div>

              {/* Apply Filters Button */}
              <button
                type="button"
                onClick={handleApplyFilters}
                className="w-full h-[54px] rounded-xl bg-[#8B2313] hover:bg-[#721C0F] text-white font-semibold text-[16px] mt-2 shadow-md transition-all duration-200 active:scale-95"
              >
                Apply Filters
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
