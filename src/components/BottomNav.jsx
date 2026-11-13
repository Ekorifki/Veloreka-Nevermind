import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Heart, ShoppingCart, User } from 'lucide-react';
import { HomeIndicator } from './MobileFrame';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'saved', label: 'Saved', icon: Heart },
  { id: 'cart', label: 'Cart', icon: ShoppingCart },
  { id: 'account', label: 'Account', icon: User },
];

export default function BottomNav({
  activeTab,
  onChangeTab,
  savedCount = 0,
  cartCount = 0,
}) {
  return (
    <div className="w-full bg-white border-t border-neutral-200/80 pt-2.5 px-6 flex flex-col flex-shrink-0 z-30">
      <div className="flex items-center justify-between pb-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badgeCount =
            item.id === 'saved'
              ? savedCount
              : item.id === 'cart'
              ? cartCount
              : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`relative flex flex-col items-center gap-1 px-2 py-0.5 transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[#8B2313]'
                  : 'text-[#808080] hover:text-[#1A1A1A]'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="bottomNavActiveDot"
                  className="absolute -top-2.5 w-6 h-0.5 rounded-full bg-[#8B2313]"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-[22px] h-[22px] transition-transform duration-200 ${
                    isActive ? 'stroke-[2.3] scale-105' : 'stroke-[1.9]'
                  }`}
                />
                {badgeCount > 0 && (
                  <motion.span
                    key={badgeCount}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#8B2313] text-white text-[10px] font-bold flex items-center justify-center leading-none"
                  >
                    {badgeCount}
                  </motion.span>
                )}
              </div>
              <span
                className={`text-[11px] ${
                  isActive ? 'font-semibold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      <HomeIndicator variant="maroon" />
    </div>
  );
}
