import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Search, Mic, XCircle, X } from 'lucide-react';
import { INITIAL_RECENT_SEARCHES } from '../data/products';
import ProductCard, { staggerContainerVariants } from './ProductCard';
import { ProductGridSkeleton } from './Skeletons';

export default function SearchScreen({
  products,
  savedIds,
  onToggleSave,
  onSelectProduct,
  onAddToCart,
  onBack,
}) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recentSearches, setRecentSearches] = useState(INITIAL_RECENT_SEARCHES);
  const [isFiltering, setIsFiltering] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const handleCategorySelect = (cat) => {
    if (cat === selectedCategory) return;
    setSelectedCategory(cat);
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 220);
  };

  const matchedProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      product.category.toLowerCase() === selectedCategory.toLowerCase() ||
      product.subCategory?.toLowerCase() === selectedCategory.toLowerCase();

    if (!normalizedQuery) return matchesCategory;

    const inName = product.name.toLowerCase().includes(normalizedQuery);
    const inCategory = product.category.toLowerCase().includes(normalizedQuery);
    const inSubCategory = product.subCategory
      ?.toLowerCase()
      .includes(normalizedQuery);
    const inTags = product.tags?.some((tag) =>
      tag.toLowerCase().includes(normalizedQuery)
    );

    return matchesCategory && (inName || inCategory || inSubCategory || inTags);
  });

  const handleRemoveRecent = (item) => {
    setRecentSearches((prev) => prev.filter((r) => r !== item));
  };

  const handleSelectRecent = (item) => {
    setQuery(item);
  };

  const isSearching = normalizedQuery.length > 0 || selectedCategory !== 'All';

  return (
    <div className="flex-1 w-full bg-white flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <h1 className="text-[22px] font-bold text-[#8B2313] tracking-tight">
          Search
        </h1>
        <button
          type="button"
          aria-label="Notifications"
          className="w-9 h-9 -mr-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-all duration-200 active:scale-95"
        >
          <Bell className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Search Input Box */}
      <div className="px-6 pb-3">
        <div className="w-full h-[52px] rounded-[12px] border border-[#E6E6E6] focus-within:border-[#8B2313] px-4 flex items-center gap-3 transition-colors bg-white">
          <Search
            className={`w-5 h-5 flex-shrink-0 transition-colors ${
              normalizedQuery ? 'text-[#8B2313]' : 'text-[#999999]'
            }`}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for clothes..."
            className="w-full h-full bg-transparent text-[16px] text-[#8B2313] placeholder:text-[#999999] outline-none font-normal"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search query"
              onClick={() => setQuery('')}
              className="text-[#999999] hover:text-[#8B2313] p-0.5 transition-all duration-200 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            aria-label="Voice search"
            className="text-[#999999] hover:text-[#8B2313] transition-all duration-200 active:scale-95 flex-shrink-0"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
          {['All', 'Apparel', "Gent's", 'Ladies', 'Footwear', 'Accessories'].map(
            (cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${
                    active
                      ? 'bg-[#8B2313] text-white shadow-sm'
                      : 'bg-neutral-100 text-[#808080] hover:text-[#1A1A1A]'
                  }`}
                >
                  {cat}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
        {!isSearching ? (
          /* Recent Searches View (Search.jpg) */
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="pt-2"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[19px] font-bold text-[#8B2313]">
                Recent Searches
              </h2>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={() => setRecentSearches([])}
                  className="text-[14px] font-medium text-[#8B2313] underline underline-offset-2 hover:opacity-80 transition-all duration-200 active:scale-95"
                >
                  Clear all
                </button>
              )}
            </div>

            {recentSearches.length === 0 ? (
              <p className="text-sm text-[#808080] py-6 text-center">
                No recent searches. Type a keyword above to discover products.
              </p>
            ) : (
              <div className="divide-y divide-[#EFEFEF]">
                {recentSearches.map((item) => (
                  <div
                    key={item}
                    className="py-3.5 flex items-center justify-between group"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectRecent(item)}
                      className="text-[16px] text-[#8B2313] font-normal text-left flex-1 hover:underline transition-all duration-200 active:scale-[0.99]"
                    >
                      {item}
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${item}`}
                      onClick={() => handleRemoveRecent(item)}
                      className="text-[#999999] hover:text-[#8B2313] transition-all duration-200 active:scale-90 p-1"
                    >
                      <XCircle className="w-5 h-5 stroke-[1.8]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : isFiltering ? (
          <div className="pt-2">
            <ProductGridSkeleton count={4} />
          </div>
        ) : matchedProducts.length > 0 ? (
          /* Staggered Filtered Results Grid */
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3.5">
              <p className="text-xs font-medium text-[#808080]">
                Showing{' '}
                <strong className="text-[#8B2313]">
                  {matchedProducts.length}
                </strong>{' '}
                {matchedProducts.length === 1 ? 'result' : 'results'}
                {query ? ` for "${query}"` : ''}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs font-semibold text-[#8B2313] underline transition-all duration-200 active:scale-95"
              >
                Reset
              </button>
            </div>

            <motion.div
              key={`${normalizedQuery}-${selectedCategory}`}
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-4"
            >
              {matchedProducts.map((product) => (
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
          </div>
        ) : (
          /* Empty State (Search - Empty.jpg) */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22 }}
            className="h-full min-h-[380px] flex flex-col items-center justify-center text-center px-4"
          >
            <svg
              width="68"
              height="68"
              viewBox="0 0 68 68"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-5"
            >
              <circle
                cx="30"
                cy="30"
                r="21"
                fill="#EFEFEF"
                stroke="#B3B3B3"
                strokeWidth="4"
              />
              <path
                d="M46 46L60 60"
                stroke="#B3B3B3"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <h2 className="text-[20px] font-bold text-[#8B2313]">
              No Results Found!
            </h2>
            <p className="text-[15px] text-[#808080] mt-2 max-w-[260px] leading-relaxed">
              Try a similar word or something more general.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
