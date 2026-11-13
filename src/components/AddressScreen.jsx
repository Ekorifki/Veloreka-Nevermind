import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, MapPin, Plus } from 'lucide-react';
import { HomeIndicator } from './MobileFrame';

export default function AddressScreen({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onGoToNewAddress,
  onBack,
}) {
  const [tempSelectedId, setTempSelectedId] = useState(
    selectedAddressId || addresses[0]?.id
  );

  useEffect(() => {
    if (selectedAddressId) {
      setTempSelectedId(selectedAddressId);
    }
  }, [selectedAddressId]);

  const handleApply = () => {
    onSelectAddress?.(tempSelectedId);
    onBack?.();
  };

  return (
    <div className="flex-1 w-full bg-white flex flex-col justify-between overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="px-6 pt-5 pb-3.5 flex items-center justify-between border-b border-neutral-100">
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-[22px] font-bold text-[#8B2313] tracking-tight">
            Address
          </h1>
          <button
            type="button"
            aria-label="Notifications"
            className="w-9 h-9 -mr-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-colors"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Saved Address List */}
        <div className="px-6 py-5">
          <h2 className="text-[17px] font-bold text-[#8B2313] mb-3.5">
            Saved Address
          </h2>

          <div className="space-y-3.5">
            {addresses.map((addr) => {
              const isSelected = tempSelectedId === addr.id;
              return (
                <div
                  key={addr.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => setTempSelectedId(addr.id)}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    setTempSelectedId(addr.id)
                  }
                  className={`rounded-2xl border p-4 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#8B2313]/50 bg-[#FDF1E8]/20'
                      : 'border-[#E6E6E6] bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <MapPin className="w-5 h-5 text-[#808080] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15.5px] font-bold text-[#8B2313] truncate">
                          {addr.nickname}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2.5 py-0.5 rounded-md bg-[#EAEAEA] text-[#8B2313] text-[11px] font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] text-[#808080] truncate mt-0.5">
                        {addr.fullAddress}
                      </p>
                    </div>
                  </div>

                  {/* Custom Radio Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'border-[#8B2313]' : 'border-[#CCCCCC]'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#8B2313]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Address Button */}
          <button
            type="button"
            onClick={onGoToNewAddress}
            className="w-full h-[54px] rounded-2xl border border-[#CCCCCC] hover:border-[#8B2313] hover:bg-neutral-50 active:scale-[0.99] text-[#8B2313] font-medium text-[15.5px] mt-4 flex items-center justify-center gap-2.5 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.2]" />
            <span>Add New Address</span>
          </button>
        </div>
      </div>

      {/* Bottom Sticky Apply Button + HomeIndicator */}
      <div className="w-full bg-white px-6 pt-2 pb-1 flex flex-col flex-shrink-0">
        <button
          type="button"
          onClick={handleApply}
          className="w-full h-[54px] rounded-xl bg-[#8B2313] hover:bg-[#721C0F] active:scale-[0.99] text-white font-medium text-[16px] shadow-md transition-all mb-2"
        >
          Apply
        </button>
        <HomeIndicator variant="maroon" />
      </div>
    </div>
  );
}
