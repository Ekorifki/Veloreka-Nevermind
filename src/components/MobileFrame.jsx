import React from 'react';

export function StatusBar({ variant = 'dark' }) {
  const isLightText = variant === 'light';
  const textColor = isLightText ? 'text-white' : 'text-[#1A1A1A]';
  const strokeColor = isLightText ? '#FFFFFF' : '#1A1A1A';

  return (
    <div
      className={`w-full px-7 pt-3 pb-2 flex items-center justify-between select-none z-30 flex-shrink-0 ${textColor}`}
    >
      <span className="text-[15px] font-semibold tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0.5" y="7" width="3" height="4" rx="1" fill={strokeColor} />
          <rect x="5" y="5" width="3" height="6" rx="1" fill={strokeColor} />
          <rect x="9.5" y="2.5" width="3" height="8.5" rx="1" fill={strokeColor} />
          <rect x="14" y="0.5" width="3" height="10.5" rx="1" fill={strokeColor} />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
          <path
            d="M8 10.5C8.82843 10.5 9.5 9.82843 9.5 9C9.5 8.17157 8.82843 7.5 8 7.5C7.17157 7.5 6.5 8.17157 6.5 9C6.5 9.82843 7.17157 10.5 8 10.5Z"
            fill={strokeColor}
          />
          <path
            d="M4.6 6.7C5.5 5.8 6.7 5.3 8 5.3C9.3 5.3 10.5 5.8 11.4 6.7"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M2 4.1C3.6 2.5 5.7 1.6 8 1.6C10.3 1.6 12.4 2.5 14 4.1"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect
            x="0.5"
            y="1"
            width="21"
            height="10"
            rx="2.5"
            stroke={strokeColor}
            strokeOpacity="0.4"
          />
          <rect x="2" y="2.5" width="18" height="7" rx="1.5" fill={strokeColor} />
          <path
            d="M23 4V8C23.8 7.6 24.3 6.9 24.3 6C24.3 5.1 23.8 4.4 23 4Z"
            fill={strokeColor}
            fillOpacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}

export function HomeIndicator({ variant = 'dark' }) {
  const barColor =
    variant === 'light'
      ? 'bg-white'
      : variant === 'maroon'
      ? 'bg-[#6A1E17]'
      : 'bg-[#1A1A1A]';

  return (
    <div className="w-full py-2 flex justify-center select-none z-30">
      <div className={`w-[134px] h-[5px] rounded-full ${barColor}`} />
    </div>
  );
}

export default function MobileFrame({ children, currentScreen, onNavigate }) {
  const navItems = [
    { id: 'splash', label: 'Splash' },
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'signup', label: 'Sign Up' },
    { id: 'login', label: 'Login' },
    { id: 'home', label: 'Home' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'search', label: 'Search' },
    { id: 'saved', label: 'Saved' },
    { id: 'details', label: 'Details' },
    { id: 'cart', label: 'My Cart' },
    { id: 'checkout', label: 'Checkout' },
    { id: 'orders', label: 'Orders' },
    { id: 'address', label: 'Address' },
    { id: 'new-address', label: 'New Address' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#111113] flex flex-col items-center justify-center sm:py-5 sm:px-4 relative">
      <div className="hidden sm:flex flex-wrap items-center justify-center gap-1 max-w-2xl mb-3 px-3 py-1.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-400 shadow-lg">
        <span className="px-1.5 font-medium text-neutral-500">Preview:</span>
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`px-2.5 py-1 rounded-full transition-all duration-200 active:scale-95 font-medium ${
              currentScreen === item.id
                ? 'bg-[#6A1E17] text-white shadow-sm'
                : 'hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md min-h-screen sm:min-h-[844px] sm:h-[844px] sm:max-h-[91vh] bg-white sm:rounded-[40px] sm:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] sm:border-[6px] sm:border-neutral-800/90 overflow-hidden flex flex-col relative">
        {children}
      </div>
    </div>
  );
}
