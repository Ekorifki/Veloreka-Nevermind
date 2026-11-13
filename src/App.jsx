import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MobileFrame, { StatusBar } from './components/MobileFrame';
import Splash from './components/Splash';
import Onboarding from './components/Onboarding';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Home from './components/Home';
import SearchScreen from './components/SearchScreen';
import SavedItemsScreen from './components/SavedItemsScreen';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import CheckoutScreen from './components/CheckoutScreen';
import AddressScreen from './components/AddressScreen';
import NewAddressScreen from './components/NewAddressScreen';
import NotificationsScreen from './components/NotificationsScreen';
import OrderHistory from './components/OrderHistory';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import BottomNav from './components/BottomNav';
import ToastNotification from './components/ToastNotification';
import { PRODUCTS } from './data/products';
import { INITIAL_ADDRESSES } from './data/addresses';
import { INITIAL_NOTIFICATIONS } from './data/notifications';
import {
  fetchProducts,
  fetchCartItems,
  addToCartApi,
  logoutUser,
  getAuthToken,
  getStoredUser,
  getStoredRole,
} from './services/api';
import {
  User as UserIcon,
  LogOut,
  MapPin,
  Bell,
  Package,
} from 'lucide-react';

const DEFAULT_SAVED_IDS = [5, 2, 6, 7, 8, 9];

const BOTTOM_NAV_SCREENS = [
  'home',
  'notifications',
  'search',
  'saved',
  'details',
  'cart',
  'orders',
  'account',
];

const pageTransitionVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.14, ease: [0.4, 0, 1, 1] },
  },
};

export function ProtectedRoute({ requiredRole, onRedirect, children }) {
  const token = getAuthToken();
  const role = getStoredRole();
  const isLegacyAdmin =
    localStorage.getItem('veloreka_admin_session') === 'authenticated';

  useEffect(() => {
    if (requiredRole === 'admin' && role === 'user' && !isLegacyAdmin) {
      onRedirect('/home');
    }
  }, [role, requiredRole, isLegacyAdmin, onRedirect]);

  if (requiredRole === 'admin' && role === 'user' && !isLegacyAdmin) {
    return null;
  }

  return children;
}

export default function App() {
  const [pathname, setPathname] = useState(
    () => window.location.pathname || '/'
  );

  const [screen, setScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [user, setUser] = useState(() => {
    const saved = getStoredUser();
    return saved
      ? {
          fullName: saved.name || saved.fullName,
          email: saved.email,
          role: saved.role || getStoredRole() || 'user',
        }
      : null;
  });

  const [products, setProducts] = useState(PRODUCTS);
  const [cartItems, setCartItems] = useState([]);
  const [savedIds, setSavedIds] = useState(DEFAULT_SAVED_IDS);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[2]);
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState(
    INITIAL_ADDRESSES[0].id
  );
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateRoute = useCallback((nextPath) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setPathname(nextPath);
  }, []);

  const triggerToast = useCallback((toastPayload) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({
      id: Date.now() + Math.random(),
      ...toastPayload,
    });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2400);
  }, []);

  const loadProductsFromServer = useCallback(async () => {
    try {
      const apiProducts = await fetchProducts();
      if (Array.isArray(apiProducts) && apiProducts.length > 0) {
        setProducts(apiProducts);
      }
    } catch {
      // Keep local fallback
    }
  }, []);

  const loadCartFromServer = useCallback(async () => {
    try {
      const serverCart = await fetchCartItems();
      setCartItems(serverCart);
    } catch {
      // Keep current cart state
    }
  }, []);

  useEffect(() => {
    loadProductsFromServer();
    loadCartFromServer();
  }, [loadProductsFromServer, loadCartFromServer]);

  const navigateTo = (targetScreen) => {
    if (targetScreen === 'login') {
      navigateRoute('/');
      return;
    }
    if (pathname === '/') {
      navigateRoute('/home');
    }
    if (targetScreen !== screen) {
      setPreviousScreen(screen);
      setScreen(targetScreen);
    }
  };

  const handleAuthSuccess = (userData) => {
    const role = userData?.role || getStoredRole() || 'user';
    setUser({ ...userData, role });
    loadCartFromServer();

    if (role === 'admin') {
      navigateRoute('/admin');
      return;
    }

    setScreen('home');
    navigateRoute('/home');
    triggerToast({
      type: 'success',
      title: `Welcome, ${userData.fullName || userData.email}!`,
      subtitle: 'Successfully signed in to Veloreka',
    });
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Session cleared in logoutUser finally
    }
    setUser(null);
    setCartItems([]);
    navigateRoute('/');
    triggerToast({
      type: 'success',
      title: 'Logged Out',
      subtitle: 'Your session has been securely ended',
    });
  };

  const handleToggleSave = (productId) => {
    const targetProduct = products.find((p) => p.id === productId);
    const isCurrentlySaved = savedIds.includes(productId);

    setSavedIds((prev) =>
      isCurrentlySaved
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );

    if (targetProduct) {
      triggerToast({
        type: 'wishlist',
        title: isCurrentlySaved
          ? 'Removed from Saved Items'
          : 'Saved to Wishlist',
        subtitle: targetProduct.name,
        image: targetProduct.image,
      });
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    navigateTo('details');
  };

  const handleAddToCart = async (product, size = 'L') => {
    try {
      const savedItem = await addToCartApi({
        product_id: product.id,
        size,
        quantity: 1,
      });

      setCartItems((prev) => {
        const existingIdx = prev.findIndex(
          (item) =>
            item.id === savedItem.id ||
            (item.product.id === product.id && item.size === size)
        );
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx] = savedItem;
          return updated;
        }
        return [savedItem, ...prev];
      });
    } catch {
      setCartItems((prev) => [
        { id: Date.now(), product, size, quantity: 1 },
        ...prev,
      ]);
    }

    triggerToast({
      type: 'cart',
      title: 'Added to Cart',
      subtitle: `${product.name} • Size ${size}`,
      image: product.image,
    });
  };

  const handleAddNewAddress = ({ nickname, fullAddress, isDefault }) => {
    const newId = `addr-${Date.now()}`;
    const newEntry = {
      id: newId,
      nickname,
      fullAddress,
      isDefault: Boolean(isDefault),
    };

    setAddresses((prev) => {
      if (isDefault) {
        return [
          newEntry,
          ...prev.map((addr) => ({ ...addr, isDefault: false })),
        ];
      }
      return [...prev, newEntry];
    });
    setSelectedAddressId(newId);
    navigateTo('address');
    triggerToast({
      type: 'success',
      title: 'New Address Added',
      subtitle: `${nickname} — ${fullAddress}`,
    });
  };

  const handleMarkNotificationRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notifId ? { ...item, isRead: true } : item
      )
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleDeleteNotification = (notifId) => {
    setNotifications((prev) => prev.filter((item) => item.id !== notifId));
  };

  // =========================================================
  // 1. UNIVERSAL SINGLE LOGIN ROUTE (/)
  // =========================================================
  if (pathname === '/' || pathname === '/login') {
    return (
      <Login
        isStandalone
        navigate={navigateRoute}
        onSuccess={handleAuthSuccess}
        onGoToSignUp={() => {
          setScreen('signup');
          navigateRoute('/home');
        }}
      />
    );
  }

  // =========================================================
  // 2. PROTECTED ADMIN ROUTES (/admin & /admin/*)
  // =========================================================
  if (pathname.startsWith('/admin')) {
    const activeAdminPath =
      pathname === '/admin/users' ||
      pathname === '/admin/products' ||
      pathname === '/admin/orders'
        ? pathname
        : '/admin/dashboard';

    return (
      <ProtectedRoute requiredRole="admin" onRedirect={navigateRoute}>
        <AdminLayout
          currentPath={activeAdminPath}
          onNavigate={navigateRoute}
          onOpenStorefront={() => {
            setScreen('home');
            navigateRoute('/home');
          }}
          onAdminLogout={handleLogout}
        >
          {activeAdminPath === '/admin/dashboard' && (
            <AdminDashboard onNavigate={navigateRoute} />
          )}
          {activeAdminPath === '/admin/users' && <AdminUsers />}
          {activeAdminPath === '/admin/products' && (
            <AdminProducts onProductsChanged={loadProductsFromServer} />
          )}
          {activeAdminPath === '/admin/orders' && <AdminOrders />}
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  // =========================================================
  // 3. CUSTOMER MOBILE STOREFRONT (/home)
  // =========================================================
  const totalCartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const unreadNotificationsCount = notifications.filter(
    (n) => !n.isRead
  ).length;
  const savedProducts = products.filter((p) => savedIds.includes(p.id));
  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0];
  const showBottomNav = BOTTOM_NAV_SCREENS.includes(screen);

  return (
    <MobileFrame currentScreen={screen} onNavigate={navigateTo}>
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />

      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 w-full flex flex-col overflow-hidden"
        >
          {screen === 'splash' && (
            <Splash onFinish={() => navigateTo('onboarding')} />
          )}

          {screen === 'onboarding' && (
            <Onboarding onComplete={() => navigateTo('signup')} />
          )}

          {screen === 'signup' && (
            <SignUp
              onSuccess={handleAuthSuccess}
              onGoToLogin={() => navigateRoute('/')}
            />
          )}

          {screen === 'login' && (
            <Login
              navigate={navigateRoute}
              onSuccess={handleAuthSuccess}
              onGoToSignUp={() => navigateTo('signup')}
            />
          )}

          {screen === 'home' && (
            <Home
              user={user}
              products={products}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              cartCount={totalCartCount}
              unreadNotificationsCount={unreadNotificationsCount}
              onGoToNotifications={() => navigateTo('notifications')}
              onGoToSearch={() => navigateTo('search')}
              onGoToCart={() => navigateTo('cart')}
              onLogout={handleLogout}
            />
          )}

          {screen === 'notifications' && (
            <NotificationsScreen
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationRead}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
              onDeleteNotification={handleDeleteNotification}
              onClearAll={() => setNotifications([])}
              onRestoreDemo={() => setNotifications(INITIAL_NOTIFICATIONS)}
              onNavigateTarget={(target) => navigateTo(target)}
              onBack={() => navigateTo('home')}
            />
          )}

          {screen === 'search' && (
            <SearchScreen
              products={products}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onBack={() => navigateTo('home')}
            />
          )}

          {screen === 'saved' && (
            <SavedItemsScreen
              savedProducts={savedProducts}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
              onClearAllSaved={() => setSavedIds([])}
              onRestoreDemoSaved={() => setSavedIds(DEFAULT_SAVED_IDS)}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onBack={() => navigateTo('home')}
            />
          )}

          {screen === 'details' && (
            <ProductDetails
              product={selectedProduct}
              isSaved={savedIds.includes(selectedProduct?.id)}
              onToggleSave={handleToggleSave}
              onAddToCart={handleAddToCart}
              onBack={() => navigateTo('home')}
            />
          )}

          {screen === 'cart' && (
            <Cart
              cartItems={cartItems}
              onCartSynced={setCartItems}
              onSelectProduct={handleSelectProduct}
              onCheckoutSuccess={(order) => {
                setCartItems([]);
                const orderNo = order?.order_number
                  ? ` (#${order.order_number})`
                  : '';
                triggerToast({
                  type: 'success',
                  title: `Order Confirmed${orderNo}!`,
                  subtitle: 'Your streetwear order has been saved to database',
                });
                navigateTo('orders');
              }}
              onBack={() => navigateTo('home')}
            />
          )}

          {screen === 'checkout' && (
            <CheckoutScreen
              cartItems={cartItems}
              selectedAddress={selectedAddress}
              onChangeAddress={() => navigateTo('address')}
              onPlaceOrderSuccess={(createdOrder) => {
                setCartItems([]);
                const orderNo = createdOrder?.order_number
                  ? ` (#${createdOrder.order_number})`
                  : '';
                navigateTo('orders');
                triggerToast({
                  type: 'success',
                  title: `Order Confirmed${orderNo}!`,
                  subtitle: 'Your streetwear package is being prepared',
                });
              }}
              onBack={() => navigateTo('cart')}
            />
          )}

          {screen === 'address' && (
            <AddressScreen
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={(id) => setSelectedAddressId(id)}
              onGoToNewAddress={() => navigateTo('new-address')}
              onBack={() => navigateTo('checkout')}
            />
          )}

          {screen === 'new-address' && (
            <NewAddressScreen
              onAddAddress={handleAddNewAddress}
              onBack={() => navigateTo('address')}
            />
          )}

          {screen === 'orders' && (
            <OrderHistory
              onBack={() => navigateTo('account')}
              onSelectProduct={handleSelectProduct}
              onGoToShop={() => navigateTo('home')}
              onGoToLogin={() => navigateRoute('/')}
            />
          )}

          {screen === 'account' && (
            <div className="flex-1 w-full bg-white flex flex-col overflow-hidden">
              <StatusBar variant="dark" />
              <div className="px-6 pt-2 pb-3.5 border-b border-neutral-100">
                <h1 className="text-[22px] font-bold text-[#8B2313]">
                  Account
                </h1>
              </div>
              <div className="flex-1 px-6 py-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#FDF1E8] flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#8B2313] text-white flex items-center justify-center">
                      <UserIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#8B2313]">
                        {user?.fullName || 'Veloreka Member'}
                      </h2>
                      <p className="text-sm text-[#666666]">
                        {user?.email || 'VeloReka@example.com'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateTo('orders')}
                    className="w-full p-4 rounded-2xl border border-neutral-200 flex items-center justify-between hover:border-[#8B2313] transition-all duration-200 active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-[#8B2313]" />
                      <div className="text-left">
                        <p className="text-sm font-bold text-[#8B2313]">
                          Order History
                        </p>
                        <p className="text-xs text-[#808080]">
                          Lihat riwayat pesanan & status pengiriman
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#8B2313] underline">
                      View
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('notifications')}
                    className="w-full p-4 rounded-2xl border border-neutral-200 flex items-center justify-between hover:border-[#8B2313] transition-all duration-200 active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-[#8B2313]" />
                      <div className="text-left">
                        <p className="text-sm font-bold text-[#8B2313]">
                          Notifications
                        </p>
                        <p className="text-xs text-[#808080]">
                          {unreadNotificationsCount} belum dibaca dari{' '}
                          {notifications.length} notifikasi
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#8B2313] underline">
                      View
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('address')}
                    className="w-full p-4 rounded-2xl border border-neutral-200 flex items-center justify-between hover:border-[#8B2313] transition-all duration-200 active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#8B2313]" />
                      <div className="text-left">
                        <p className="text-sm font-bold text-[#8B2313]">
                          Saved Addresses ({addresses.length})
                        </p>
                        <p className="text-xs text-[#808080]">
                          {selectedAddress?.nickname}:{' '}
                          {selectedAddress?.fullAddress}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#8B2313] underline">
                      Manage
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full h-[52px] rounded-xl border border-[#8B2313] text-[#8B2313] hover:bg-[#FDF1E8] font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {showBottomNav && (
        <BottomNav
          activeTab={
            ['details', 'notifications'].includes(screen)
              ? previousScreen
              : screen === 'orders'
              ? 'account'
              : screen
          }
          onChangeTab={navigateTo}
          savedCount={savedIds.length}
          cartCount={totalCartCount}
        />
      )}
    </MobileFrame>
  );
}
