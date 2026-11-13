import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  RefreshCw,
  MapPin,
  CreditCard,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '../services/api';

function formatCurrency(value) {
  const num = Number(value || 0);
  if (Number.isInteger(num)) {
    return `$ ${num.toLocaleString('en-US')}`;
  }
  return `$ ${num.toFixed(2)}`;
}

function formatOrderDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusStyle(status) {
  const normalized = String(status || 'pending').toLowerCase();
  if (normalized === 'confirmed' || normalized === 'completed') {
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
  }
  if (normalized === 'cancelled') {
    return 'bg-red-500/15 text-red-400 border-red-500/40';
  }
  return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
}

export default function OrderHistory({
  onBack,
  onSelectProduct,
  onGoToShop,
  onGoToLogin,
}) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      setErrorMessage('Silakan login terlebih dahulu untuk melihat riwayat pesanan.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || `Gagal memuat pesanan (${response.status})`);
      }

      const list = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];
      setOrders(list);
    } catch (err) {
      setErrorMessage(err.message || 'Tidak dapat terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="flex-1 w-full bg-[#0B0B0E] text-zinc-100 flex flex-col overflow-hidden">
      <div className="px-6 pt-5 pb-3.5 flex items-center justify-between border-b border-zinc-800 bg-[#0B0B0E]/95 backdrop-blur">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="w-9 h-9 -ml-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 flex items-center justify-center text-zinc-200 hover:border-[#8B2313] hover:text-white transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E04F3E]" />
          <h1 className="text-[19px] font-black uppercase tracking-[0.12em] text-white">
            Order History
          </h1>
        </div>

        <button
          type="button"
          aria-label="Refresh Orders"
          onClick={fetchOrders}
          className="w-9 h-9 -mr-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 flex items-center justify-center text-zinc-300 hover:border-[#8B2313] hover:text-white transition-all duration-200 active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((skeleton) => (
              <div
                key={skeleton}
                className="rounded-2xl border border-zinc-800 bg-[#131318] p-4 space-y-3 animate-pulse"
              >
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-zinc-800 rounded" />
                  <div className="h-5 w-20 bg-zinc-800 rounded-full" />
                </div>
                <div className="h-16 w-full bg-zinc-900 rounded-xl" />
                <div className="h-4 w-40 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : errorMessage ? (
          <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl border border-[#8B2313]/50 bg-[#8B2313]/15 flex items-center justify-center text-[#E04F3E] mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-extrabold uppercase tracking-wider text-white">
              Access Required
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-[260px] leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex items-center gap-3 mt-5">
              {onGoToLogin && (
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="px-5 py-2.5 rounded-xl bg-[#8B2313] hover:bg-[#a12917] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95"
                >
                  Login Account
                </button>
              )}
              <button
                type="button"
                onClick={fetchOrders}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95"
              >
                Retry
              </button>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl border border-zinc-800 bg-[#14141A] flex items-center justify-center text-zinc-500 mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest text-white">
              No Orders Yet
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-[250px] leading-relaxed">
              Belum ada riwayat transaksi. Mulai koleksi streetwear Y2K pertamamu sekarang.
            </p>
            <button
              type="button"
              onClick={onGoToShop || onBack}
              className="mt-6 px-6 py-3 rounded-xl bg-[#8B2313] hover:bg-[#a12917] border border-[#E04F3E]/40 text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 active:scale-95"
            >
              Explore Drop
            </button>
          </div>
        ) : (
          orders.map((order, idx) => {
            const items = order.order_items || order.orderItems || [];
            return (
              <motion.div
                key={order.id || order.order_number}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: idx * 0.05 }}
                className="rounded-2xl border border-zinc-800 hover:border-zinc-700 bg-[#121217] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
              >
                <div className="px-4 py-3 bg-[#181820] border-b border-zinc-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 block">
                      ORDER ID
                    </span>
                    <p className="font-mono text-sm font-bold text-white tracking-wider">
                      #{order.order_number}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-widest ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status || 'CONFIRMED'}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {formatOrderDate(order.created_at)}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {items.map((item) => {
                    const product = item.product || {};
                    return (
                      <div
                        key={item.id}
                        onClick={() =>
                          product.id && onSelectProduct ? onSelectProduct(product) : null
                        }
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0D0D11] border border-zinc-800/90 hover:border-zinc-700 transition-colors cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name || 'Product'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-zinc-100 truncate">
                            {product.name || `Product #${item.product_id}`}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-300">
                              SIZE {item.size || 'L'}
                            </span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="font-mono text-xs font-bold text-white">
                            {formatCurrency(item.sub_total || item.price * item.quantity)}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {formatCurrency(item.price)} / item
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-4 py-3 bg-[#0E0E13] border-t border-zinc-800/90 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1.5 truncate max-w-[65%]">
                      <MapPin className="w-3.5 h-3.5 text-[#E04F3E] flex-shrink-0" />
                      <span className="truncate">
                        {order.delivery_nickname
                          ? `${order.delivery_nickname} • `
                          : ''}
                        {order.delivery_address}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 uppercase font-mono text-[10px] text-zinc-300">
                      <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                      {order.payment_method || 'CARD'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      Total Paid
                    </span>
                    <span className="font-mono text-base font-black text-[#E04F3E]">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
