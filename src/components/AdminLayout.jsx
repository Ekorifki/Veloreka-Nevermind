import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  LogOut,
  ExternalLink,
  Search,
  Bell,
  Flame,
  ChevronRight,
} from 'lucide-react';

const NAV_LINKS = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard Overview',
    icon: LayoutDashboard,
  },
  {
    path: '/admin/users',
    label: 'Customers & Users',
    icon: Users,
  },
  {
    path: '/admin/products',
    label: 'Product Catalog',
    icon: Package,
  },
  {
    path: '/admin/orders',
    label: 'Orders & Status',
    icon: ClipboardList,
  },
];

export default function AdminLayout({
  currentPath,
  onNavigate,
  onAdminLogout,
  onOpenStorefront,
  children,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col lg:flex-row p-3 md:p-5 gap-5 font-sans">
      <aside className="w-full lg:w-72 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/30 flex items-center justify-center flex-shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 block">
                NEVERMIND STUDIO
              </span>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
                Veloreka Admin
              </h1>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Main Navigation
            </p>
            {NAV_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`w-full px-4 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-between transition-all duration-200 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                      : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
              STREETWEAR DROP
            </p>
            <p className="text-xs font-semibold text-zinc-100 mt-1">
              Nevermind Y2K Season 04 Live Telemetry
            </p>
            {onOpenStorefront && (
              <button
                type="button"
                onClick={onOpenStorefront}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Mobile Store</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onAdminLogout}
            className="w-full px-4 py-3 rounded-2xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <header className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search analytics, streetwear SKU, or order ID..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('/admin/orders')}
              className="relative w-10 h-10 rounded-2xl bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-colors"
              title="View Orders"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-red-600 absolute top-2.5 right-2.5" />
            </button>

            <div className="h-7 w-px bg-slate-100 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white font-black text-sm flex items-center justify-center shadow-sm shadow-red-600/20">
                NM
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  Admin Nevermind
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Head of Streetwear Ops
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
