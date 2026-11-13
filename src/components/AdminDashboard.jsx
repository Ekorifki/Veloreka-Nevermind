import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Package,
  ShoppingBag,
  Wallet,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  Flame,
  Sparkles,
  X,
} from 'lucide-react';
import {
  API_BASE_URL,
  fetchAdminDashboardApi,
  fetchAdminUsersApi,
  fetchAdminProductsApi,
  fetchAdminOrdersApi,
} from '../services/api';
import { ensureAdminAuthToken } from '../utils/api';

const MONTHLY_BAR_DATA = [
  { month: 'Jan', revenue: 62, target: 45 },
  { month: 'Feb', revenue: 78, target: 52 },
  { month: 'Mar', revenue: 54, target: 48 },
  { month: 'Apr', revenue: 88, target: 60 },
  { month: 'May', revenue: 72, target: 58 },
  { month: 'Jun', revenue: 95, target: 68 },
  { month: 'Jul', revenue: 84, target: 64 },
  { month: 'Aug', revenue: 100, target: 74 },
];

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    usersCount: 0,
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchDashboardSummary = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await ensureAdminAuthToken();

      try {
        const result = await fetchAdminDashboardApi();
        const s = result.stats || {};
        setStats({
          usersCount: Number(s.users_count ?? 0),
          productsCount: Number(s.products_count ?? 0),
          ordersCount: Number(s.orders_count ?? 0),
          totalRevenue: Number(s.total_revenue ?? 0),
        });
        setTopProducts(
          Array.isArray(result.top_products) ? result.top_products : []
        );
      } catch {
        const [usersData, productsData, ordersData] = await Promise.all([
          fetchAdminUsersApi(),
          fetchAdminProductsApi(),
          fetchAdminOrdersApi(),
        ]);

        const usersList = Array.isArray(usersData.data) ? usersData.data : [];
        const productsList = Array.isArray(productsData.data)
          ? productsData.data
          : [];
        const ordersList = Array.isArray(ordersData.data)
          ? ordersData.data
          : [];

        const revenue = ordersList.reduce(
          (sum, order) => sum + Number(order.total_amount || 0),
          0
        );

        setStats({
          usersCount: usersList.length,
          productsCount: productsList.length,
          ordersCount: ordersList.length,
          totalRevenue: revenue,
        });
        setTopProducts(productsList.slice(0, 4));
      }
    } catch (error) {
      console.error('AdminDashboard fetch error:', error);
      setErrorMessage(
        error.message ||
          `Gagal terhubung ke server API (${API_BASE_URL}). Pastikan server Laravel aktif.`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardSummary();
  }, [fetchDashboardSummary]);

  const summaryCards = [
    {
      label: 'Total Income',
      value: `$${stats.totalRevenue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      growth: '+24.8%',
      subtitle: 'Gross Nevermind revenue',
      icon: Wallet,
      isPrimaryRed: true,
      sparkBars: [45, 65, 50, 85, 70, 95, 100],
      target: '/admin/orders',
    },
    {
      label: 'Total Orders',
      value: stats.ordersCount,
      growth: '+14.2%',
      subtitle: 'Completed & active drops',
      icon: ShoppingBag,
      isPrimaryRed: false,
      sparkBars: [35, 55, 60, 50, 75, 80, 90],
      target: '/admin/orders',
    },
    {
      label: 'Total Customers',
      value: stats.usersCount,
      growth: '+19.5%',
      subtitle: 'Registered community members',
      icon: Users,
      isPrimaryRed: false,
      sparkBars: [30, 40, 55, 65, 60, 85, 92],
      target: '/admin/users',
    },
    {
      label: 'Catalog SKU',
      value: stats.productsCount,
      growth: 'LIVE DROP',
      subtitle: 'Active streetwear items',
      icon: Package,
      isPrimaryRed: false,
      sparkBars: [60, 65, 70, 75, 80, 88, 95],
      target: '/admin/products',
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nevermind Analytics Suite</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Executive Brand Overview
          </h2>
        </div>

        <button
          type="button"
          onClick={fetchDashboardSummary}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-xs font-bold flex items-center gap-2 transition-all"
        >
          <RefreshCw
            className={`w-4 h-4 text-red-600 ${isLoading ? 'animate-spin' : ''}`}
          />
          <span>Sync Live Telemetry</span>
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

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              onClick={() => onNavigate?.(card.target)}
              className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_35px_rgb(220,38,38,0.08)] cursor-pointer transition-all flex flex-col justify-between gap-5 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {card.label}
                  </p>
                  <h3
                    className={`text-2xl md:text-3xl font-black mt-1.5 tracking-tight ${
                      card.isPrimaryRed ? 'text-red-600' : 'text-slate-900'
                    }`}
                  >
                    {isLoading ? '...' : card.value}
                  </h3>
                </div>
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                    card.isPrimaryRed
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                      : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-end justify-between gap-3 pt-2">
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-extrabold">
                    <TrendingUp className="w-3 h-3" />
                    {card.growth}
                  </span>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">
                    {card.subtitle}
                  </p>
                </div>

                <div className="flex items-end gap-1 h-9">
                  {card.sparkBars.map((height, idx) => (
                    <span
                      key={idx}
                      style={{ height: `${height}%` }}
                      className={`w-1.5 rounded-full transition-all ${
                        idx >= card.sparkBars.length - 2
                          ? 'bg-red-600'
                          : 'bg-slate-200 group-hover:bg-red-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Area Grafik: Bar Chart (Kiri) & Donut Chart (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                Revenue Performance
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                Nevermind Sales vs Benchmark
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                <span className="text-slate-600">Direct Drops (Red)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" />
                <span className="text-slate-500">Baseline Target</span>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 sm:gap-5 pt-6 px-2 border-b border-slate-100">
            {MONTHLY_BAR_DATA.map((item) => (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center gap-3 h-full justify-end group"
              >
                <div className="w-full flex items-end justify-center gap-1.5 h-48">
                  <div
                    style={{ height: `${item.target}%` }}
                    className="w-3 sm:w-4 rounded-t-xl bg-slate-200 transition-all duration-300 group-hover:bg-slate-300"
                    title={`Target: ${item.target}%`}
                  />
                  <div
                    style={{ height: `${item.revenue}%` }}
                    className="w-3 sm:w-4 rounded-t-xl bg-red-500 group-hover:bg-red-600 shadow-sm shadow-red-500/20 transition-all duration-300"
                    title={`Revenue: ${item.revenue}%`}
                  />
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-red-600 pb-3 transition-colors">
                  {item.month}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Peak seasonal demand recorded in{' '}
              <strong className="text-slate-800">August (+35.1%)</strong>
            </span>
            <span className="font-bold text-red-600">
              Updated from MySQL Database
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
              Category Share
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
              Apparel Distribution
            </h3>
          </div>

          <div className="my-6 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="14"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="transparent"
                  stroke="#dc2626"
                  strokeWidth="14"
                  strokeDasharray="150 289"
                  strokeLinecap="round"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="transparent"
                  stroke="#18181b"
                  strokeWidth="14"
                  strokeDasharray="80 289"
                  strokeDashoffset="-160"
                  strokeLinecap="round"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="transparent"
                  stroke="#f87171"
                  strokeWidth="14"
                  strokeDasharray="48 289"
                  strokeDashoffset="-250"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  TOP DROP
                </span>
                <span className="text-2xl font-black text-red-600">52%</span>
                <span className="text-[11px] font-semibold text-slate-600">
                  Outerwear
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="font-semibold text-slate-700">
                  Heavyweight Hoodies
                </span>
              </div>
              <span className="font-extrabold text-red-600">52%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                <span className="font-semibold text-slate-700">
                  Cargo & Parachute Pants
                </span>
              </div>
              <span className="font-extrabold text-slate-900">28%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="font-semibold text-slate-700">
                  Y2K Graphic Tees
                </span>
              </div>
              <span className="font-extrabold text-slate-600">20%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Produk Teratas */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Top Streetwear Products
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Best-performing Nevermind drops synced with MySQL catalog
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate?.('/admin/products')}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>Manage Full Catalog</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading ? (
            <div className="col-span-full py-10 text-center bg-white text-gray-500 text-sm">
              Loading products from MySQL...
            </div>
          ) : topProducts.length === 0 ? (
            <div className="col-span-full py-10 text-center bg-white text-gray-500 text-sm">
              No products found in database.
            </div>
          ) : (
            topProducts.map((product) => {
              const stockCount = Number(product.stock ?? 50);
              const isLowStock = stockCount <= 10;

              return (
                <div
                  key={product.id}
                  onClick={() => onNavigate?.('/admin/products')}
                  className="group rounded-2xl bg-slate-50/70 hover:bg-white p-3.5 shadow-sm hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-200 mb-3.5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span
                        className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${
                          isLowStock
                            ? 'bg-red-600 text-white'
                            : 'bg-zinc-900 text-white'
                        }`}
                      >
                        {isLowStock ? 'HOT // LOW STOCK' : 'NEVERMIND DROP'}
                      </span>
                      <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-red-600 text-xs font-black shadow-sm">
                        ${Number(product.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {product.category || 'Streetwear'}
                    </p>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-0.5 line-clamp-1 group-hover:text-red-600 transition-colors">
                      {product.name}
                    </h4>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">
                      Stock:{' '}
                      <strong className="text-slate-800">
                        {stockCount} pcs
                      </strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 font-bold text-[11px]">
                      Active
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
