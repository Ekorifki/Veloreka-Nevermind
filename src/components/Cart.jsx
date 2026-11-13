import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  Plus,
  Minus,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { formatPrice } from './ProductCard';
import { API_BASE_URL, getAuthToken, normalizeCartItem } from '../services/api';

export const SHIPPING_FEE = 80;

export function formatSummaryCurrency(amount) {
  const num = Number(amount || 0);
  if (Number.isInteger(num)) {
    return `$ ${num.toLocaleString('en-US')}`;
  }
  return `$ ${num.toFixed(2)}`;
}

export default function Cart({
  cartItems: externalCartItems,
  onCartSynced,
  onSelectProduct,
  onCheckoutSuccess,
  onGoToNotifications,
  onBack,
}) {
  const [items, setItems] = useState(externalCartItems || []);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage('');
    const token = getAuthToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && Array.isArray(result.data)) {
        const normalized = result.data
          .map(normalizeCartItem)
          .filter((row) => row && row.product);
        setItems(normalized);
        onCartSynced?.(normalized);
      }
    } catch {
      // Pertahankan state lokal jika jaringan terputus sementara
    } finally {
      setIsLoading(false);
    }
  }, [onCartSynced]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleDeleteItem = async (cartId) => {
    const token = getAuthToken();
    const updated = items.filter((item) => item.id !== cartId);
    setItems(updated);
    onCartSynced?.(updated);

    try {
      await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      fetchCart();
    }
  };

  const handleUpdateQty = async (item, newQty) => {
    if (newQty <= 0) {
      await handleDeleteItem(item.id);
      return;
    }

    const token = getAuthToken();
    const updated = items.map((row) =>
      row.id === item.id ? { ...row, quantity: newQty } : row
    );
    setItems(updated);
    onCartSynced?.(updated);

    try {
      await fetch(`${API_BASE_URL}/cart/${item.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });
    } catch {
      fetchCart();
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    setStatusMessage('');
    const token = getAuthToken();

    try {
      const response = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          delivery_nickname: 'Home',
          delivery_address: 'DI. PandjaitanMok',
          payment_method: 'card',
          shipping_fee: SHIPPING_FEE,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || 'Gagal memproses checkout.');
      }

      setItems([]);
      onCartSynced?.([]);
      onCheckoutSuccess?.(result.data);
    } catch (err) {
      setStatusMessage(err.message || 'Terjadi kesalahan saat checkout.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subTotal = items.reduce(
    (sum, item) => sum + Number(item.product?.price || 0) * item.quantity,
    0
  );
  const vat = 0;
  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const total = subTotal + vat + shipping;

  return (
    <div className="flex-1 w-full bg-white flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="px-6 pt-5 pb-3.5 flex items-center justify-between border-b border-neutral-100">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <h1 className="text-[22px] font-bold text-[#8B2313] tracking-tight">
          My Cart
        </h1>
        <button
          type="button"
          aria-label="Notifications"
          onClick={onGoToNotifications}
          className="w-9 h-9 -mr-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-all duration-200 active:scale-95"
        >
          <Bell className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 flex flex-col justify-between">
        {isLoading && items.length === 0 ? (
          <div className="space-y-3.5 py-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-24 rounded-2xl bg-neutral-100 animate-pulse"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-[#808080]">
                <span>
                  <strong className="text-[#8B2313]">{items.length}</strong>{' '}
                  {items.length === 1 ? 'product' : 'products'} in cart
                </span>
              </div>

              {statusMessage && (
                <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-[#ED1010]">
                  {statusMessage}
                </div>
              )}

              {/* Cart Item Cards matching My Cart.png */}
              <div className="space-y-3.5">
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const itemSubtotal =
                      Number(item.product?.price || 0) * item.quantity;
                    return (
                      <motion.div
                        key={item.id || `${item.product?.id}-${item.size}`}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -40, scale: 0.95 }}
                        transition={{ duration: 0.22 }}
                        className="rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-neutral-100 p-3.5 flex items-center justify-between gap-3"
                      >
                        {/* Thumbnail */}
                        <div
                          onClick={() => onSelectProduct?.(item.product)}
                          className="w-16 h-16 rounded-xl bg-neutral-50 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-200 active:scale-95"
                        >
                          <img
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <h3
                            onClick={() => onSelectProduct?.(item.product)}
                            className="text-[15.5px] font-medium text-[#8B2313] truncate cursor-pointer hover:underline"
                          >
                            {item.product?.name}
                          </h3>
                          <p className="text-[11.5px] text-[#808080] mt-0.5">
                            Size:{' '}
                            <strong className="text-[#1A1A1A]">
                              {item.size}
                            </strong>
                            {' • '}
                            Subtotal:{' '}
                            <strong className="text-[#8B2313]">
                              {formatPrice(itemSubtotal)}
                            </strong>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[16px] font-bold text-[#1A1A1A]">
                              {formatPrice(Number(item.product?.price || 0))}
                            </span>
                            {item.product?.oldPrice && (
                              <span className="text-[12px] text-[#999999] line-through">
                                {formatPrice(Number(item.product.oldPrice))}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls (+ / qty / -) & Remove */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            aria-label={`Remove ${item.product?.name}`}
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-neutral-300 hover:text-[#ED1010] transition-all duration-200 active:scale-95 p-0.5"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() =>
                                handleUpdateQty(item, item.quantity + 1)
                              }
                              className="w-6 h-6 rounded-full border border-[#222222] text-[#222222] flex items-center justify-center hover:bg-neutral-100 transition-all duration-200 active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>

                            <span className="text-[15px] font-bold text-[#8B2313] min-w-[16px] text-center">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                handleUpdateQty(item, item.quantity - 1)
                              }
                              className="w-6 h-6 rounded-full bg-[#222222] text-white flex items-center justify-center hover:bg-black transition-all duration-200 active:scale-95"
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Summary & Checkout CTA */}
            <div className="pt-6 pb-2">
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

                <div className="border-t border-neutral-200 my-2 pt-3 flex items-center justify-between">
                  <span className="text-[#1A1A1A] font-medium">Total</span>
                  <span className="text-[18px] font-bold text-[#1A1A1A]">
                    {formatSummaryCurrency(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isCheckingOut}
                onClick={handleCheckout}
                className="w-full h-[54px] rounded-xl bg-[#8B2313] hover:bg-[#721C0F] disabled:opacity-60 transition-all duration-200 active:scale-95 text-white font-medium text-[16px] mt-5 flex items-center justify-center gap-2.5 shadow-md"
              >
                <span>
                  {isCheckingOut ? 'Processing Checkout...' : 'Go To Checkout'}
                </span>
                <ArrowRight className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>
          </>
        ) : (
          /* Empty Cart State matching My Cart - Empty.png */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.24 }}
            className="h-full min-h-[420px] flex flex-col items-center justify-center text-center px-4"
          >
            <svg
              width="72"
              height="68"
              viewBox="0 0 72 68"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-5"
            >
              <path
                d="M8 10H16L22.4 42.2C22.8 44.4 24.7 46 27 46H53.8C56 46 57.9 44.5 58.4 42.4L63 20H18"
                stroke="#B3B3B3"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18 20H63L58.4 42.4C57.9 44.5 56 46 53.8 46H27C24.7 46 22.8 44.4 22.4 42.2L18 20Z"
                fill="#EDEDED"
              />
              <circle cx="28" cy="56" r="4.5" fill="#B3B3B3" />
              <circle cx="52" cy="56" r="4.5" fill="#B3B3B3" />
            </svg>
            <h2 className="text-[20px] font-bold text-[#B84A49]">
              Your Cart Is Empty!
            </h2>
            <p className="text-[15px] text-[#808080] mt-2.5 max-w-[260px] leading-relaxed">
              When you add products, they&apos;ll appear here.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl bg-[#8B2313] hover:bg-[#721C0F] text-white text-xs font-semibold transition-all duration-200 active:scale-95 shadow-sm"
              >
                Explore Products
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
