import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function GoogleAuthButton({
  label,
  onClick,
  loading = false,
  disabled = false,
  loadingLabel = 'Connecting to Google...',
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full h-[54px] rounded-[10px] border border-[#CCCCCC] transition-all flex items-center justify-center gap-3 bg-white ${
        isDisabled
          ? 'opacity-75 cursor-not-allowed bg-neutral-50'
          : 'hover:bg-neutral-50 active:scale-[0.99]'
      }`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 text-[#1A1A1A] animate-spin" />
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z"
            fill="#4285F4"
          />
          <path
            d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.1H2.18V16.94C3.99 20.53 7.7 23 12 23Z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.1C5.62 13.44 5.49 12.73 5.49 12C5.49 11.27 5.62 10.56 5.84 9.9V7.06H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.94L5.84 14.1Z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span className="text-[16px] font-medium text-[#1A1A1A]">
        {loading ? loadingLabel : label}
      </span>
    </button>
  );
}

export default function FormInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  status = 'default', // 'default' | 'error' | 'success'
  errorMessage = '',
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const borderClass =
    status === 'error'
      ? 'border-[#ED1010] focus-within:border-[#ED1010]'
      : status === 'success'
      ? 'border-[#0C9409] focus-within:border-[#0C9409]'
      : 'border-[#E6E6E6] focus-within:border-[#1A1A1A]';

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block text-[16px] font-medium text-[#1A1A1A] mb-1.5 tracking-[-0.01em]"
      >
        {label}
      </label>
      <div
        className={`w-full h-[52px] rounded-[10px] border px-4 flex items-center gap-2 transition-colors bg-white ${borderClass}`}
      >
        <input
          id={id}
          name={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          className="w-full h-full bg-transparent text-[16px] text-[#1A1A1A] placeholder:text-[#999999] outline-none"
        />

        {/* Right Adornments */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-[#808080] hover:text-[#1A1A1A] transition-colors p-0.5"
            >
              {showPassword ? (
                <Eye className="w-5 h-5 text-[#1A1A1A]" />
              ) : (
                <EyeOff className="w-5 h-5 text-[#999999]" />
              )}
            </button>
          )}

          {status === 'error' && (
            <AlertCircle className="w-5 h-5 text-[#ED1010] flex-shrink-0" />
          )}

          {status === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-[#0C9409] flex-shrink-0" />
          )}
        </div>
      </div>

      {status === 'error' && errorMessage && (
        <p className="text-[#ED1010] text-[14px] font-normal mt-1.5 leading-snug">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
