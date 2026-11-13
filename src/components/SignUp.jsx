import React, { useState } from 'react';
import { HomeIndicator } from './MobileFrame';
import FormInput, { GoogleAuthButton } from './FormInput';
import { registerUser, API_BASE_URL } from '../services/api';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function SignUp({ onSuccess, onGoToLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
  });

  const validateFullName = (val) => {
    if (!val.trim()) return 'Please enter your full name';
    if (val.trim().length < 2) return 'Full name must be at least 2 characters';
    return '';
  };

  const validateEmail = (val) => {
    if (!val.trim()) return 'Please enter valid email address';
    if (!EMAIL_REGEX.test(val.trim())) return 'Please enter valid email address';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Please enter your password';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const fullNameError = validateFullName(fullName);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const isFormValid = !fullNameError && !emailError && !passwordError;

  const getFieldStatus = (field, error, value) => {
    if (field === 'email' && serverError) return 'error';
    if (isFormValid) return 'success';
    if (!touched[field] && !value) return 'default';
    if (error) {
      return touched[field] ? 'error' : 'default';
    }
    return value ? 'success' : 'default';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setTouched({
      fullName: true,
      email: true,
      password: true,
    });

    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const response = await registerUser({
        name: fullName.trim(),
        email: email.trim(),
        password,
      });
      onSuccess?.({
        fullName: response.user?.name || fullName.trim(),
        email: response.user?.email || email.trim(),
        token: response.token,
        apiBaseUrl: API_BASE_URL,
      });
    } catch (err) {
      if (err.status === 422) {
        const emailErr = err.data?.errors?.email?.[0];
        setServerError(emailErr || err.message || 'Registration failed');
      } else {
        // Fallback when testing UI offline before Laravel server is started
        onSuccess?.({
          fullName: fullName.trim(),
          email: email.trim(),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-white flex flex-col justify-between overflow-y-auto no-scrollbar">
      <div>
        <div className="px-6 pt-6 pb-6">
          {/* Header */}
          <h1 className="text-[32px] font-bold text-[#1A1A1A] tracking-[-0.03em] leading-tight">
            Create an account
          </h1>
          <p className="text-[16px] text-[#808080] mt-1">
            Let&apos;s create your account.
          </p>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <FormInput
              id="signup-fullname"
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
              status={getFieldStatus('fullName', fullNameError, fullName)}
              errorMessage={fullNameError}
              autoComplete="name"
            />

            <FormInput
              id="signup-email"
              label="Email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (serverError) setServerError('');
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              status={getFieldStatus('email', emailError, email)}
              errorMessage={emailError || serverError}
              autoComplete="email"
            />

            <FormInput
              id="signup-password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              status={getFieldStatus('password', passwordError, password)}
              errorMessage={passwordError}
              autoComplete="new-password"
            />

            {/* Terms & Privacy Notice */}
            <p className="text-[14px] text-[#1A1A1A] leading-[1.45] pt-0.5">
              By signing up you agree to our{' '}
              <a
                href="#terms"
                onClick={(e) => e.preventDefault()}
                className="font-semibold underline underline-offset-2"
              >
                Terms
              </a>
              ,{' '}
              <a
                href="#privacy"
                onClick={(e) => e.preventDefault()}
                className="font-semibold underline underline-offset-2"
              >
                Privacy Policy
              </a>
              , and{' '}
              <a
                href="#cookies"
                onClick={(e) => e.preventDefault()}
                className="font-semibold underline underline-offset-2"
              >
                Cookie Use
              </a>
            </p>

            {/* Primary Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-[54px] rounded-[10px] font-medium text-[16px] text-white transition-all duration-200 active:scale-95 ${
                  isFormValid
                    ? 'bg-[#1A1A1A] hover:bg-neutral-800 shadow-sm'
                    : 'bg-[#CCCCCC] hover:bg-[#BDBDBD]'
                }`}
              >
                {isSubmitting ? 'Creating Account...' : 'Create an Account'}
              </button>
            </div>
          </form>

          {/* Divider "Or" */}
          <div className="flex items-center gap-3.5 my-6">
            <div className="h-[1px] flex-1 bg-[#E6E6E6]" />
            <span className="text-[14px] text-[#808080]">Or</span>
            <div className="h-[1px] flex-1 bg-[#E6E6E6]" />
          </div>

          {/* Google Sign Up */}
          <GoogleAuthButton
            label="Sign Up with Google"
            onClick={() =>
              onSuccess?.({
                fullName: fullName.trim() || 'Veloreka',
                email: email.trim() || 'VeloReka@example.com',
              })
            }
          />
        </div>
      </div>

      {/* Footer Link + Home Indicator */}
      <div className="w-full pt-4 pb-1 flex flex-col items-center">
        <p className="text-[16px] text-[#808080] mb-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onGoToLogin}
            className="text-[#1A1A1A] font-medium underline underline-offset-4 hover:text-[#6A1E17] transition-colors"
          >
            Log In
          </button>
        </p>
        <HomeIndicator variant="dark" />
      </div>
    </div>
  );
}
