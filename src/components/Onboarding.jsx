import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const SLIDES = [
  {
    id: 0,
    theme: 'light',
    image: '/images/onboarding-1-clean.jpg',
    alt: 'Editorial fashion model in black blazer with red hair',
  },
  {
    id: 1,
    theme: 'dark',
    image: '/images/onboarding-2-clean.jpg',
    alt: 'Editorial fashion model in stitched denim jacket',
  },
];

export default function Onboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (deltaX < -45 && currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (deltaX > 45 && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
    setTouchStartX(null);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`flex-1 w-full relative overflow-hidden flex flex-col justify-between select-none transition-colors duration-500 ${
        currentSlide === 0 ? 'bg-white' : 'bg-black'
      }`}
    >
      {/* Carousel Slides Track */}
      <div
        className="flex w-full h-full flex-1 transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {/* Slide 1 */}
        <div className="w-full h-full flex-shrink-0 relative bg-white overflow-hidden">
          <img
            src={SLIDES[0].image}
            alt={SLIDES[0].alt}
            className="w-full h-full object-cover object-top pointer-events-none"
          />

          {/* Slide 1 Typography Overlay */}
          <div className="absolute top-0 left-0 right-0 pt-10 px-6 z-10 pointer-events-none">
            <h1 className="text-[44px] sm:text-[46px] font-extrabold leading-[0.94] tracking-[-0.04em]">
              <span className="text-[#641E17] block">Time to</span>
              <span className="text-[#641E17] block">Upgrade your</span>
              <span className="block">
                <span className="text-[#641E17]">Style. </span>
                <span className="text-[#1A1A1A]">Start</span>
              </span>
              <span className="text-[#1A1A1A] block">Now.</span>
            </h1>
          </div>
        </div>

        {/* Slide 2 */}
        <div className="w-full h-full flex-shrink-0 relative bg-black overflow-hidden">
          <img
            src={SLIDES[1].image}
            alt={SLIDES[1].alt}
            className="w-full h-full object-cover object-top pointer-events-none"
          />

          {/* Slide 2 Typography Overlay */}
          <div className="absolute top-0 left-0 right-0 pt-10 px-6 z-10 pointer-events-none">
            <h1 className="text-[43px] sm:text-[45px] font-extrabold leading-[0.95] tracking-[-0.04em]">
              <span className="text-white block">Discover your</span>
              <span className="text-white block">new look.</span>
              {/* Visually blended into hair in the artwork layer; kept in DOM for semantics */}
              <span className="sr-only">Be bold. Be you.</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Bottom Controls Overlay (Pagination Dots + CTA Buttons) */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-10 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-20 flex flex-col items-center">
        {/* Pagination Indicator */}
        <div className="flex items-center justify-center gap-2.5 mb-5">
          {SLIDES.map((slide, idx) => {
            const isActive = currentSlide === idx;
            return (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-14 bg-[#6B1E19]'
                    : 'w-2 bg-[#E0E0E0] hover:bg-white'
                }`}
              />
            );
          })}
        </div>

        {/* Slide Action Buttons */}
        {currentSlide === 0 ? (
          <button
            type="button"
            onClick={handleNext}
            className="w-full h-[54px] rounded-xl bg-[#6B1E19] hover:bg-[#7D241E] active:scale-[0.99] text-white font-medium text-[16px] flex items-center justify-center gap-2.5 transition-all shadow-lg"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 stroke-[2.2]" />
          </button>
        ) : (
          <div className="w-full flex items-center gap-3.5">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 h-[54px] rounded-xl bg-[#222222] hover:bg-[#2E2E2E] active:scale-[0.99] text-white font-medium text-[16px] flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 h-[54px] rounded-xl bg-[#6B1E19] hover:bg-[#7D241E] active:scale-[0.99] text-white font-medium text-[16px] flex items-center justify-center transition-all shadow-lg"
            >
              <span>Next</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
