import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCheck,
  Percent,
  Package,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { StatusBar } from './MobileFrame';

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.24,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const FILTER_TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'unread', label: 'Belum Dibaca' },
  { id: 'promo', label: 'Promo' },
  { id: 'order', label: 'Pesanan' },
  { id: 'system', label: 'Sistem' },
];

function NotificationTypeBadge({ type, isRead }) {
  if (type === 'promo') {
    return (
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
          isRead
            ? 'bg-[#FDF1E8] text-[#8B2313]'
            : 'bg-[#8B2313] text-white shadow-sm'
        }`}
      >
        <Percent className="w-5 h-5 stroke-[2.3]" />
      </div>
    );
  }

  if (type === 'order') {
    return (
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
          isRead
            ? 'bg-emerald-50 text-[#0C9409]'
            : 'bg-[#0C9409] text-white shadow-sm'
        }`}
      >
        <Package className="w-5 h-5 stroke-[2.1]" />
      </div>
    );
  }

  return (
    <div
      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
        isRead
          ? 'bg-neutral-100 text-[#1A1A1A]'
          : 'bg-[#1A1A1A] text-white shadow-sm'
      }`}
    >
      <ShieldAlert className="w-5 h-5 stroke-[2.1]" />
    </div>
  );
}

export default function NotificationsScreen({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onRestoreDemo,
  onNavigateTarget,
  onBack,
}) {
  const [activeFilter, setActiveFilter] = useState('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !item.isRead;
    return item.type === activeFilter;
  });

  return (
    <div className="flex-1 w-full bg-white flex flex-col overflow-hidden">
      <StatusBar variant="dark" />

      {/* Top Header matching Product Details / My Cart */}
      <div className="px-6 pt-2 pb-3.5 flex items-center justify-between border-b border-neutral-100">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-[#8B2313] hover:bg-neutral-100 transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold text-[#8B2313] tracking-tight">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#8B2313] text-white text-[11px] font-bold leading-none">
              {unreadCount}
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label="Mark all notifications as read"
          title="Tandai semua sudah dibaca"
          onClick={onMarkAllAsRead}
          disabled={unreadCount === 0}
          className={`w-9 h-9 -mr-1.5 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
            unreadCount > 0
              ? 'text-[#8B2313] hover:bg-neutral-100'
              : 'text-neutral-300 cursor-not-allowed'
          }`}
        >
          <CheckCheck className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Filter Chips & Quick Actions */}
      <div className="px-6 pt-3 pb-2 border-b border-neutral-100/80">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-[#8B2313] text-white font-semibold shadow-sm'
                    : 'bg-neutral-100 text-[#808080] hover:text-[#1A1A1A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center justify-between mt-2.5 pb-1 text-xs text-[#808080]">
            <span>
              Menampilkan{' '}
              <strong className="text-[#8B2313]">
                {filteredNotifications.length}
              </strong>{' '}
              notifikasi
            </span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-[#8B2313] font-medium hover:underline transition-all duration-200 active:scale-95"
                >
                  Baca semua
                </button>
              )}
              <button
                type="button"
                onClick={onClearAll}
                className="text-[#808080] hover:text-[#ED1010] underline transition-all duration-200 active:scale-95"
              >
                Kosongkan (Preview Empty)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Notification List or Empty State */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
        {filteredNotifications.length > 0 ? (
          <motion.div
            key={activeFilter}
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3 pb-4"
          >
            <AnimatePresence initial={false}>
              {filteredNotifications.map((item) => {
                const isUnread = !item.isRead;
                return (
                  <motion.div
                    key={item.id}
                    variants={listItemVariants}
                    layout
                    exit={{ opacity: 0, x: -30, scale: 0.96 }}
                    onClick={() => onMarkAsRead?.(item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      (e.key === 'Enter' || e.key === ' ') &&
                      onMarkAsRead?.(item.id)
                    }
                    className={`w-full rounded-2xl border p-4 flex items-start gap-3.5 text-left cursor-pointer transition-all duration-200 active:scale-[0.99] relative ${
                      isUnread
                        ? 'bg-[#FDF1E8]/65 border-[#8B2313]/25 shadow-[0_4px_18px_rgba(139,35,19,0.06)]'
                        : 'bg-white border-[#EFEFEF] opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Type Icon */}
                    <NotificationTypeBadge
                      type={item.type}
                      isRead={item.isRead}
                    />

                    {/* Text Content */}
                    <div className="flex-1 min-w-0 pr-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            item.type === 'promo'
                              ? 'bg-[#FDF1E8] text-[#8B2313]'
                              : item.type === 'order'
                              ? 'bg-emerald-50 text-[#0C9409]'
                              : 'bg-neutral-100 text-[#1A1A1A]'
                          }`}
                        >
                          {item.type === 'promo'
                            ? 'Promo'
                            : item.type === 'order'
                            ? 'Pesanan'
                            : 'Sistem'}
                        </span>
                        <span className="text-[11px] text-[#999999] font-medium">
                          {item.time}
                        </span>
                      </div>

                      <h3
                        className={`text-[14.5px] leading-snug mt-1.5 ${
                          isUnread
                            ? 'font-bold text-[#8B2313]'
                            : 'font-semibold text-[#1A1A1A]'
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p
                        className={`text-[13px] leading-relaxed mt-1 ${
                          isUnread ? 'text-[#4D4D4D]' : 'text-[#808080]'
                        }`}
                      >
                        {item.message}
                      </p>

                      {item.actionScreen && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead?.(item.id);
                            onNavigateTarget?.(item.actionScreen);
                          }}
                          className="mt-2.5 text-[12px] font-semibold text-[#8B2313] underline underline-offset-2 hover:opacity-80 transition-all duration-200 active:scale-95"
                        >
                          Lihat Detail →
                        </button>
                      )}
                    </div>

                    {/* Right Side: Unread Accent Dot & Delete Button */}
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                      {isUnread && (
                        <span
                          title="Belum dibaca"
                          className="w-2.5 h-2.5 rounded-full bg-[#8B2313] ring-4 ring-[#8B2313]/15"
                        />
                      )}
                      <button
                        type="button"
                        aria-label={`Delete notification ${item.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification?.(item.id);
                        }}
                        className="text-neutral-300 hover:text-[#ED1010] p-1 rounded-lg transition-all duration-200 active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty State consistent with Cart / Saved Items Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.24 }}
            className="h-full min-h-[400px] flex flex-col items-center justify-center text-center px-4"
          >
            <svg
              width="70"
              height="70"
              viewBox="0 0 70 70"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-5"
            >
              <path
                d="M35 10C23.9543 10 15 18.9543 15 30V41.5L10.2 47.9C9.4 49 10.18 50.5 11.55 50.5H58.45C59.82 50.5 60.6 49 59.8 47.9L55 41.5V30C55 18.9543 46.0457 10 35 10Z"
                fill="#EDEDED"
                stroke="#B3B3B3"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M28 52C28.8 56 31.6 59 35 59C38.4 59 41.2 56 42 52"
                stroke="#B3B3B3"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>

            <h2 className="text-[20px] font-bold text-[#B84A49]">
              Belum ada notifikasi
            </h2>
            <p className="text-[15px] text-[#808080] mt-2.5 max-w-[270px] leading-relaxed">
              Anda belum memiliki notifikasi saat ini. Kami akan memberi tahu
              Anda saat ada promo atau pembaruan pesanan.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl bg-[#8B2313] hover:bg-[#721C0F] text-white text-xs font-semibold transition-all duration-200 active:scale-95 shadow-sm"
              >
                Kembali ke Home
              </button>
              {onRestoreDemo && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('all');
                    onRestoreDemo();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-[#808080] text-xs font-medium transition-all duration-200 active:scale-95"
                >
                  Muat Demo Notifikasi
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
