import React from 'react';

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
