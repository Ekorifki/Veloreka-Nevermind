import React from 'react';

export function ProductGridSkeleton({ count = 4 }) {
  return (
    <div
      aria-label="Loading products"
      className="grid grid-cols-2 gap-4 pb-2 animate-pulse"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex flex-col">
          <div className="rounded-2xl bg-neutral-200/80 aspect-[1/1.05] mb-3 relative overflow-hidden">
            <div className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-neutral-300/70" />
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-24 h-7 rounded-lg bg-neutral-300/80" />
          </div>
          <div className="h-3 w-14 rounded bg-neutral-200 mb-1.5" />
          <div className="h-4 w-3/4 rounded bg-neutral-200 mb-1.5" />
          <div className="h-4 w-1/2 rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div
      aria-label="Loading product details"
      className="px-6 pt-2 pb-6 animate-pulse"
    >
      {/* Main Image Skeleton */}
      <div className="w-full h-[290px] rounded-2xl bg-neutral-200/80 mb-3 relative">
        <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-neutral-300/80" />
      </div>

      {/* Thumbnails Skeleton */}
      <div className="flex items-center justify-center gap-2.5 mt-2 mb-5">
        <div className="w-14 h-14 rounded-xl bg-neutral-200/80" />
        <div className="w-14 h-14 rounded-xl bg-neutral-200/80" />
        <div className="w-14 h-14 rounded-xl bg-neutral-200/80" />
      </div>

      {/* Category & Title Skeleton */}
      <div className="flex items-center justify-between mb-2">
        <div className="h-5 w-20 rounded-full bg-neutral-200" />
        <div className="h-4 w-32 rounded bg-neutral-200" />
      </div>
      <div className="h-7 w-48 rounded-lg bg-neutral-200 mt-2" />

      {/* Rating Row Skeleton */}
      <div className="flex items-center gap-2 mt-3">
        <div className="w-5 h-5 rounded-full bg-neutral-200" />
        <div className="h-4 w-28 rounded bg-neutral-200" />
      </div>

      {/* Description Lines Skeleton */}
      <div className="space-y-2 mt-4">
        <div className="h-3.5 w-full rounded bg-neutral-200" />
        <div className="h-3.5 w-11/12 rounded bg-neutral-200" />
        <div className="h-3.5 w-4/5 rounded bg-neutral-200" />
      </div>

      {/* Size Pills Skeleton */}
      <div className="mt-6">
        <div className="h-5 w-28 rounded bg-neutral-200 mb-3" />
        <div className="flex items-center gap-3">
          <div className="w-[52px] h-[48px] rounded-[12px] bg-neutral-200" />
          <div className="w-[52px] h-[48px] rounded-[12px] bg-neutral-200" />
          <div className="w-[52px] h-[48px] rounded-[12px] bg-neutral-200" />
          <div className="w-[52px] h-[48px] rounded-[12px] bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}
