import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  X,
  ChevronDown,
  Check,
  AlertCircle,
} from 'lucide-react';
import { HomeIndicator } from './MobileFrame';
import { ADDRESS_NICKNAME_OPTIONS } from '../data/addresses';

export default function NewAddressScreen({ onAddAddress, onBack }) {
  const [nickname, setNickname] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [touched, setTouched] = useState({
    nickname: false,
    fullAddress: false,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const nicknameError = !nickname.trim()
    ? 'Please choose an address nickname'
    : '';
  const fullAddressError =
    !fullAddress.trim() || fullAddress.trim().length < 4
      ? 'Please enter your full address'
      : '';

  const isFormValid = !nicknameError && !fullAddressError;

  const handleSimulateFilled = () => {
    setNickname('Home');
    setFullAddress('DI. PandjaitanMok');
    setIsDefault(true);
    setTouched({ nickname: false, fullAddress: false });
  };

  const handleSimulateEmpty = () => {
    setNickname('');
    setFullAddress('');
    setIsDefault(false);
    setTouched({ nickname: false, fullAddress: false });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      nickname: true,
      fullAddress: true,
    });

    if (isFormValid) {
      setShowSuccessModal(true);
    }
  };

  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    onAddAddress?.({
      nickname: nickname.trim(),
      fullAddress: fullAddress.trim(),
      isDefault,
    });
  };

  return (
    <div className="flex-1 w-full bg-white flex flex-col justify-between overflow-hidden relative">
      {/* Top Bar */}
      <div>
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-[22px] font-bold text-[#8B2313] tracking-tight">
            New Address
          </h1>
          <button
            type="button"
            aria-label="Notifications"
            className="w-9 h-9 -mr-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-colors"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Subtle Quick State Switcher to preview Empty vs Filled Figma variants */}
        <div className="px-6 pt-1 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleSimulateEmpty}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-neutral-200 text-[#808080] hover:bg-neutral-50 transition-colors"
          >
            Empty State
          </button>
          <button
            type="button"
            onClick={handleSimulateFilled}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FDF1E8] text-[#8B2313] hover:bg-[#F7E2D2] transition-colors"
          >
            Simulate Filled
          </button>
        </div>
      </div>

      {/* Bottom Sheet Form Section matching New Address.jpg & New Address - Filled.jpg */}
      <div className="w-full bg-white rounded-t-[28px] px-6 pt-3 pb-1 flex flex-col border-t border-neutral-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        {/* Handle Bar */}
        <div className="w-16 h-1.5 rounded-full bg-[#E5E5E5] mx-auto mb-4" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-200/80">
          <h2 className="text-[20px] font-bold text-[#8B2313]">Address</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onBack}
            className="text-[#8B2313] p-1 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="pt-4 space-y-4">
          {/* Address Nickname Dropdown */}
          <div>
            <label
              htmlFor="address-nickname"
              className="block text-[15.5px] font-medium text-[#8B2313] mb-1.5"
            >
              Address Nickname
            </label>
            <div className="relative">
              <select
                id="address-nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, nickname: true }))
                }
                className={`w-full h-[52px] rounded-xl border px-4 pr-10 appearance-none bg-white text-[16px] outline-none transition-colors ${
                  touched.nickname && nicknameError
                    ? 'border-[#ED1010] text-[#1A1A1A]'
                    : 'border-[#E6E6E6] focus:border-[#8B2313]'
                } ${
                  nickname ? 'text-[#8B2313] font-medium' : 'text-[#999999]'
                }`}
              >
                <option value="" disabled>
                  Choose One
                </option>
                {ADDRESS_NICKNAME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="text-[#1A1A1A]">
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-[#8B2313] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
            </div>
            {touched.nickname && nicknameError && (
              <p className="text-[#ED1010] text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{nicknameError}</span>
              </p>
            )}
          </div>

          {/* Full Address Input */}
          <div>
            <label
              htmlFor="full-address"
              className="block text-[15.5px] font-medium text-[#8B2313] mb-1.5"
            >
              Full Address
            </label>
            <input
              id="full-address"
              type="text"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, fullAddress: true }))
              }
              placeholder="Enter your full address..."
              className={`w-full h-[52px] rounded-xl border px-4 bg-white text-[15.5px] text-[#1A1A1A] placeholder:text-[#999999] outline-none transition-colors ${
                touched.fullAddress && fullAddressError
                  ? 'border-[#ED1010]'
                  : 'border-[#E6E6E6] focus:border-[#8B2313]'
              }`}
            />
            {touched.fullAddress && fullAddressError && (
              <p className="text-[#ED1010] text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{fullAddressError}</span>
              </p>
            )}
          </div>

          {/* Default Address Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none pt-0.5">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${
                isDefault
                  ? 'bg-[#8B2313] border-[#8B2313] text-white'
                  : 'bg-white border-[#CCCCCC]'
              }`}
            >
              {isDefault && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <span className="text-[15px] text-[#808080]">
              Make this as a default address
            </span>
          </label>

          {/* Add Button */}
          <div className="pt-2 pb-2">
            <button
              type="submit"
              className={`w-full h-[54px] rounded-xl font-medium text-[16px] text-white transition-all active:scale-[0.99] ${
                isFormValid
                  ? 'bg-[#8B2313] hover:bg-[#721C0F] shadow-md'
                  : 'bg-[#CCCCCC] hover:bg-[#BDBDBD]'
              }`}
            >
              Add
            </button>
          </div>
        </form>

        <HomeIndicator variant="maroon" />
      </div>

      {/* Congratulations Modal matching New Address - Filled-1.jpg */}
      {showSuccessModal && (
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] z-50 flex items-center justify-center px-6">
          <div className="w-full max-w-[340px] bg-white rounded-3xl px-6 py-7 text-center shadow-2xl border border-neutral-100">
            <div className="w-[74px] h-[74px] rounded-full bg-[#D9F2D9] border-[4px] border-[#0C9409] text-[#0C9409] flex items-center justify-center mx-auto mb-5">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <h3 className="text-[22px] font-bold text-[#8B2313]">
              Congratulations!
            </h3>
            <p className="text-[15px] text-[#808080] mt-2">
              Your new address has been added.
            </p>

            <button
              type="button"
              onClick={handleConfirmSuccess}
              className="w-full h-[52px] rounded-xl bg-[#8B2313] hover:bg-[#721C0F] active:scale-[0.99] text-white font-medium text-[16px] mt-6 shadow-md transition-all"
            >
              Thanks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
