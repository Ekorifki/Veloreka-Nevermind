import React, { useEffect } from 'react';
import { StatusBar, HomeIndicator } from './MobileFrame';

export default function Splash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onFinish?.()}
      title="Click or wait to continue to Onboarding"
      className="flex-1 w-full bg-[#1A1A1A] flex flex-col justify-between items-center cursor-pointer select-none relative overflow-hidden"
    >
      <StatusBar variant="light" />

      {/* Center Brand Logo (NEVERMIND) */}
      <div className="flex-1 flex items-center justify-center px-10 w-full">
        <img
          src="/images/nevermind-logo.png"
          alt="NEVERMIND"
          className="w-full max-w-[280px] object-contain drop-shadow-sm animate-pulse"
        />
      </div>

      {/* Bottom Circular Gradient Loader + Home Indicator */}
      <div className="w-full flex flex-col items-center pb-1">
        <div className="mb-14 relative w-14 h-14 flex items-center justify-center">
          <svg
            className="w-14 h-14 animate-spin"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="splashSpinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <circle
              cx="28"
              cy="28"
              r="22"
              stroke="url(#splashSpinnerGrad)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <HomeIndicator variant="light" />
      </div>
    </div>
  );
}
