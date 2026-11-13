import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  MapPin,
  CreditCard,
  Banknote,
  Pencil,
  Tag,
  Check,
} from 'lucide-react';
import { HomeIndicator } from './MobileFrame';
import { SHIPPING_FEE, formatSummaryCurrency } from './CartScreen';
import { checkoutOrderApi } from '../services/api';

export default function CheckoutScreen({
  cartItems,
  selectedAddress,
  onChangeAddress,
  onPlaceOrderSuccess,
  onCheckoutError,
  onBack,
}) {
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'cash' | 'pay'
  const [cardLast4, setCardLast4] = useState('7110');
  const [isEditingCard, setIsEditingCard] = useState(false);

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [checkoutErrorMessage, setCheckoutErrorMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = cartItems.length > 0 ? SHIPPING_FEE : 0;
  const discountAmount = appliedPromo ? Number((subTotal * 0.3).toFixed(2)) : 0;
  const total = Math.max(0, subTotal + shipping - discountAmount);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (['6B98T409', 'NEVERMIND22', 'STREET25', 'VELOREKA'].includes(code)) {
      setAppliedPromo(code);
      setPromoMessage(`Coupon ${code} applied (30% off)!`);
    } else {
      setAppliedPromo(code);
      setPromoMessage(`Promo code "${code}" applied!`);
    }
  };

  // 3. Checkout Handler -> POST /api/checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      const msg = 'Keranjang belanja kosong.';
      setCheckoutErrorMessage(msg);
      onCheckoutError?.(msg);
      return;
    }

    setIsSubmittingOrder(true);
    setCheckoutErrorMessage('');

    try {
      const payload = {
        delivery_nickname: selectedAddress?.nickname || 'Home',
        delivery_address: selectedAddress?.fullAddress || 'DI. PandjaitanMok',
        payment_method: paymentMethod,
        shipping_fee: shipping,
        discount_amount: discountAmount,
        promo_code: appliedPromo,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          size: item.size,
          quantity: item.quantity,
        })),
      };

      const response = await checkoutOrderApi(payload);
      setCreatedOrder(response.data || null);
      setShowOrderSuccess(true);
    } catch (err) {
      const errorMsg =
        err.message || 'Gagal memproses pesanan ke server backend.';
      setCheckoutErrorMessage(errorMsg);
      onCheckoutError?.(errorMsg);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-white flex flex-col justify-between overflow-hidden relative">
      {/* Scrollable Checkout Body */}
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
            Checkout
          </h1>
          <button
            type="button"
            aria-label="Notifications"
            className="w-9 h-9 -mr-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-colors"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* 1. Delivery Address Section */}
          <div className="pb-5 border-b border-neutral-200/80">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-bold text-[#8B2313]">
                Delivery Address
              </h2>
              <button
                type="button"
                onClick={onChangeAddress}
                className="text-[14px] font-medium text-[#8B2313] underline underline-offset-2 hover:opacity-80"
              >
                Change
              </button>
            </div>

            <div
              onClick={onChangeAddress}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onChangeAddress?.()}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <MapPin className="w-5 h-5 text-[#808080] mt-0.5 flex-shrink-0 group-hover:text-[#8B2313] transition-colors" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-[#8B2313]">
                    {selectedAddress?.nickname || 'Home'}
                  </p>
                  {selectedAddress?.isDefault && (
                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-[10px] font-semibold text-[#8B2313]">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-[#808080] mt-0.5">
                  {selectedAddress?.fullAddress || 'DI. PandjaitanMok'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Payment Method Section */}
          <div className="pb-5 border-b border-neutral-200/80">
            <h2 className="text-[17px] font-bold text-[#8B2313] mb-3.5">
              Payment Method
            </h2>

            {/* 3 Payment Method Tabs: Card | Cash | Apple Pay */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`h-[42px] rounded-xl border text-[14px] font-medium flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-[#8B2313] text-white border-[#8B2313] shadow-sm'
                    : 'bg-white text-[#1A1A1A] border-[#E6E6E6] hover:border-[#8B2313]/50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`h-[42px] rounded-xl border text-[14px] font-medium flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-[#8B2313] text-white border-[#8B2313] shadow-sm'
                    : 'bg-white text-[#1A1A1A] border-[#E6E6E6] hover:border-[#8B2313]/50'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pay')}
                className={`h-[42px] rounded-xl border text-[14px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'pay'
                    ? 'bg-[#8B2313] text-white border-[#8B2313] shadow-sm'
                    : 'bg-white text-[#1A1A1A] border-[#E6E6E6] hover:border-[#8B2313]/50'
                }`}
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 170 170"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.13-1.9-14.34-6.08-3.69-3.03-7.61-7.82-11.77-14.37-5.93-9.19-10.72-19.74-14.38-31.67-3.66-11.92-5.49-22.95-5.49-33.08 0-12.74 3.19-23.22 9.56-31.44 6.38-8.22 14.38-12.48 24.01-12.79 4.81 0 10.12 1.48 15.93 4.44 5.81 2.96 9.56 4.49 11.24 4.61 1.34 0 5.48-1.74 12.41-5.21 6.94-3.47 12.81-4.96 17.61-4.47 13.42 1.08 23.49 6.38 30.2 15.9-11.97 7.26-17.84 17.44-17.61 30.53.22 10.18 4.02 18.67 11.41 25.46 5.14 4.81 11.29 7.64 18.45 8.5-1.46 4.49-3.29 8.84-5.48 13.06zM119.22 31.01c0 7.98-2.92 15.42-8.75 22.32-7.03 8.23-15.54 12.99-24.75 12.23-.19-.96-.29-1.99-.29-3.09 0-7.67 3.21-15.88 9.63-22.94 3.08-3.44 6.99-6.29 11.74-8.55 4.74-2.25 9.24-3.5 13.48-3.73.23 1.29.34 2.54.34 3.76z" />
                </svg>
                <span>Pay</span>
              </button>
            </div>

            {/* Selected Method Detail Box */}
            {paymentMethod === 'card' && (
              <div className="w-full h-[54px] rounded-xl border border-[#E6E6E6] px-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <span className="text-[18px] font-black italic tracking-tighter text-[#8B2313]">
                    VISA
                  </span>
                  {isEditingCard ? (
                    <input
                      type="text"
                      maxLength={4}
                      value={cardLast4}
                      onChange={(e) =>
                        setCardLast4(e.target.value.replace(/\D/g, ''))
                      }
                      onBlur={() => setIsEditingCard(false)}
                      autoFocus
                      className="w-20 border-b border-[#8B2313] text-[15px] font-medium text-[#8B2313] outline-none"
                    />
                  ) : (
                    <span className="text-[15px] font-medium text-[#8B2313] tracking-wider">
                      **** **** **** {cardLast4 || '7110'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Edit card number"
                  onClick={() => setIsEditingCard((prev) => !prev)}
                  className="text-[#8B2313] hover:opacity-75 p-1"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="w-full h-[54px] rounded-xl border border-[#E6E6E6] px-4 flex items-center justify-between bg-white">
                <span className="text-[14px] font-medium text-[#8B2313]">
                  Cash on Delivery (COD) — Pay when order arrives
                </span>
              </div>
            )}

            {paymentMethod === 'pay' && (
              <div className="w-full h-[54px] rounded-xl border border-[#E6E6E6] px-4 flex items-center justify-between bg-white">
                <span className="text-[14px] font-medium text-[#8B2313]">
                  Apple Pay Express • Connected Wallet
                </span>
              </div>
            )}
          </div>

          {/* 3. Order Summary Section */}
          <div>
            <h2 className="text-[17px] font-bold text-[#8B2313] mb-3.5">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-[16px]">
              <div className="flex items-center justify-between">
                <span className="text-[#808080]">Sub-total</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {formatSummaryCurrency(subTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#808080]">VAT (%)</span>
                <span className="font-semibold text-[#1A1A1A]">$ 0.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#808080]">Shipping fee</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {formatSummaryCurrency(shipping)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-[#0C9409]">
                  <span>Discount ({appliedPromo})</span>
                  <span className="font-semibold">
                    - {formatSummaryCurrency(discountAmount)}
                  </span>
                </div>
              )}

              <div className="border-t border-neutral-200 my-2 pt-3 flex items-center justify-between">
                <span className="text-[#8B2313] font-medium">Total</span>
                <span className="text-[18px] font-bold text-[#8B2313]">
                  {formatSummaryCurrency(total)}
                </span>
              </div>
            </div>

            {/* Promo Code Row */}
            <form
              onSubmit={handleApplyPromo}
              className="flex items-center gap-3 mt-4"
            >
              <div className="flex-1 h-[52px] rounded-xl border border-[#E6E6E6] focus-within:border-[#8B2313] px-3.5 flex items-center gap-2.5 bg-white">
                <Tag className="w-5 h-5 text-[#999999] flex-shrink-0" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Enter promo code"
                  className="w-full h-full bg-transparent text-[15px] text-[#1A1A1A] placeholder:text-[#999999] outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-[52px] px-7 rounded-xl bg-[#8B2313] hover:bg-[#721C0F] text-white font-medium text-[15px] transition-all shadow-sm active:scale-95"
              >
                Add
              </button>
            </form>

            {promoMessage && (
              <p className="text-xs font-medium text-[#0C9409] mt-2">
                {promoMessage}
              </p>
            )}

            {checkoutErrorMessage && (
              <p className="text-xs font-medium text-[#ED1010] mt-2">
                {checkoutErrorMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sticky CTA + HomeIndicator */}
      <div className="w-full bg-white px-6 pt-2 pb-1 flex flex-col flex-shrink-0 border-t border-neutral-100">
        <button
          type="button"
          disabled={isSubmittingOrder}
          onClick={handleCheckout}
          className="w-full h-[54px] rounded-xl bg-[#8B2313] hover:bg-[#721C0F] disabled:opacity-60 active:scale-[0.99] text-white font-medium text-[16px] shadow-md transition-all mb-2"
        >
          {isSubmittingOrder ? 'Processing Order...' : 'Place Order'}
        </button>
        <HomeIndicator variant="maroon" />
      </div>

      {/* Order Placed Confirmation Modal */}
      {showOrderSuccess && (
        <div className="absolute inset-0 bg-black/45 z-50 flex items-center justify-center px-6">
          <div className="w-full max-w-[340px] bg-white rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#E8F8E8] border-[3px] border-[#0C9409] text-[#0C9409] flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-[22px] font-bold text-[#8B2313]">
              Order Placed!
            </h3>
            {createdOrder?.order_number && (
              <p className="text-xs font-semibold text-[#8B2313] mt-1">
                Order ID: #{createdOrder.order_number}
              </p>
            )}
            <p className="text-[14.5px] text-[#808080] mt-1.5 leading-relaxed">
              Your order ({formatSummaryCurrency(total)}) will be shipped to{' '}
              <strong className="text-[#1A1A1A]">
                {selectedAddress?.nickname || 'Home'}
              </strong>{' '}
              ({selectedAddress?.fullAddress || 'DI. PandjaitanMok'}).
            </p>
            <button
              type="button"
              onClick={() => {
                setShowOrderSuccess(false);
                onPlaceOrderSuccess?.(createdOrder);
              }}
              className="w-full h-[50px] rounded-xl bg-[#8B2313] hover:bg-[#721C0F] text-white font-medium text-[15px] mt-5 shadow-md transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
