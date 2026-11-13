import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  RefreshCw,
  X,
  Eye,
  Package,
  MapPin,
  User as UserIcon,
  Check,
  ClipboardList,
} from 'lucide-react';
import { ensureAdminAuthToken } from '../utils/api';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

function formatCurrency(val) {
  return `$${Number(val || 0).toFixed(2)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusValue, setStatusValue] = useState('Pending');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchAdminOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await ensureAdminAuthToken();

      console.log('Fetching to:', API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/admin/orders`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          result.message ||
            `Gagal memuat daftar pesanan (HTTP ${response.status})`
        );
      }
      const list = Array.isArray(result.data) ? result.data : [];
      setOrders(list);
    } catch (error) {
      console.error('AdminOrders fetch error:', error);
      setErrorMessage(
        error.message ||
          `Gagal terhubung ke server API (${API_BASE_URL}). Pastikan server Laravel aktif.`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminOrders();
  }, [fetchAdminOrders]);

  const handleInspectOrder = (order) => {
    setSelectedOrder(order);
    setStatusValue(order.status || 'Pending');
  };

  const handleUpdateOrderStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    setErrorMessage('');

    try {
      await ensureAdminAuthToken();

      console.log('Fetching to:', API_BASE_URL);
      const response = await fetch(
        `${API_BASE_URL}/admin/orders/${selectedOrder.id}/status`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengubah status pesanan.');
      }

      const updatedOrder = result.data;
      setStatusValue(updatedOrder.status);
      setSelectedOrder(updatedOrder);
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    } catch (error) {
      console.error('AdminOrders update status error:', error);
      setErrorMessage(error.message || 'Gagal mengubah status pesanan.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6 pb-6 font-sans relative">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 block">
            Fulfillment & Dispatch
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2.5 mt-1">
            <ClipboardList className="w-6 h-6 text-red-600" />
            <span>Incoming Orders ({orders.length})</span>
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchAdminOrders}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 shadow-sm text-xs font-bold flex items-center gap-2 transition-all"
        >
          <RefreshCw
            className={`w-4 h-4 text-red-600 ${isLoading ? 'animate-spin' : ''}`}
          />
          <span>Refresh Orders</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex items-center justify-between shadow-sm">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-slate-700 uppercase text-xs font-semibold tracking-wider">
                <th className="py-4 px-6">Order Number</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Delivery Address</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="bg-white">
                  <td
                    colSpan={6}
                    className="py-12 px-6 text-center bg-white text-gray-500 text-sm"
                  >
                    Loading orders from database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr className="bg-white">
                  <td
                    colSpan={6}
                    className="py-12 px-6 text-center bg-white text-gray-500 text-sm"
                  >
                    No orders recorded.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusStr = String(order.status || 'Pending');
                  const statusLower = statusStr.toLowerCase();
                  const isCompleted =
                    statusLower === 'shipped' ||
                    statusLower === 'delivered' ||
                    statusLower === 'confirmed';
                  const isCancelled = statusLower === 'cancelled';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleInspectOrder(order)}
                      className="bg-white border-b border-gray-100 hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 text-sm">
                        <p className="font-bold text-gray-900">
                          #{order.order_number}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(order.created_at)}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <p className="font-semibold text-gray-900">
                          {order.user?.name || 'Guest User'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {order.user?.email || '-'}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        <span className="font-medium text-gray-900">
                          {order.delivery_nickname
                            ? `${order.delivery_nickname}: `
                            : ''}
                        </span>
                        {order.delivery_address}
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700'
                              : isCancelled
                              ? 'bg-red-50 text-red-600'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {statusStr}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectOrder(order);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-600 text-gray-700 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white border-l border-gray-100 z-50 flex flex-col overflow-hidden font-sans shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 block">
                    Order Details & Status
                  </span>
                  <h2 className="text-lg font-extrabold text-gray-900">
                    #{selectedOrder.order_number}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="rounded-2xl bg-slate-50 p-4 border border-gray-100 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                    Update Order Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ORDER_STATUSES.map((st) => {
                      const active =
                        String(statusValue).toLowerCase() === st.toLowerCase();
                      return (
                        <button
                          key={st}
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() => handleUpdateOrderStatus(st)}
                          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                            active
                              ? 'bg-red-600 text-white shadow-sm shadow-red-600/25'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:text-red-600'
                          }`}
                        >
                          <span>{st}</span>
                          {active && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 border border-gray-100 shadow-xs space-y-2.5 text-sm">
                  <div className="flex items-center gap-2.5 text-gray-900 font-semibold">
                    <UserIcon className="w-4 h-4 text-red-600" />
                    <span>
                      {selectedOrder.user?.name || 'Customer'} (
                      {selectedOrder.user?.email || 'No email'})
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 text-gray-500">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>
                      {selectedOrder.delivery_nickname
                        ? `${selectedOrder.delivery_nickname}: `
                        : ''}
                      {selectedOrder.delivery_address}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Purchased Items
                  </h3>

                  {(
                    selectedOrder.order_items ||
                    selectedOrder.orderItems ||
                    []
                  ).map((item) => {
                    const prod = item.product || {};
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-gray-100 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-12 h-12 rounded-xl object-cover bg-white border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {prod.name || `Product #${item.product_id}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              Size: {item.size} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(
                            item.sub_total || item.price * item.quantity
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.sub_total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping Fee</span>
                    <span>{formatCurrency(selectedOrder.shipping_fee)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total Amount</span>
                    <span className="text-red-600">
                      {formatCurrency(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
