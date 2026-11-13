export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const TOKEN_STORAGE_KEY = 'token';
const LEGACY_TOKEN_KEY = 'veloreka_token';
const USER_STORAGE_KEY = 'veloreka_user';
const ROLE_STORAGE_KEY = 'veloreka_role';

export function getAuthToken() {
  try {
    return (
      localStorage.getItem(TOKEN_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_TOKEN_KEY) ||
      null
    );
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredRole() {
  try {
    const storedRole =
      localStorage.getItem(ROLE_STORAGE_KEY) || localStorage.getItem('role');
    if (storedRole) return storedRole;
    const user = getStoredUser();
    return user?.role || null;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user, role) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(LEGACY_TOKEN_KEY, token);
    }
    const resolvedRole = role || user?.role || 'user';
    localStorage.setItem(ROLE_STORAGE_KEY, resolvedRole);
    localStorage.setItem('role', resolvedRole);
    if (user) {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify({ ...user, role: resolvedRole })
      );
    }
  } catch {
    // Ignore storage errors
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem('role');
    localStorage.removeItem('veloreka_admin_session');
  } catch {
    // Ignore storage errors
  }
}

export function normalizeProduct(raw) {
  if (!raw) return null;
  return {
    ...raw,
    id: Number(raw.id),
    fitTitle: raw.fitTitle ?? raw.fit_title ?? 'Regular Fit',
    subCategory: raw.subCategory ?? raw.sub_category ?? 'Apparel',
    price: Number(raw.price),
    oldPrice:
      raw.oldPrice !== undefined && raw.oldPrice !== null
        ? Number(raw.oldPrice)
        : raw.old_price !== undefined && raw.old_price !== null
        ? Number(raw.old_price)
        : null,
    rating: Number(raw.rating ?? 4.5),
    reviewsCount: Number(raw.reviewsCount ?? raw.reviews_count ?? 0),
    gallery: Array.isArray(raw.gallery)
      ? raw.gallery
      : raw.image
      ? [raw.image]
      : [],
    sizes: Array.isArray(raw.sizes) ? raw.sizes : ['S', 'M', 'L', 'XL'],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  };
}

export function normalizeCartItem(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    product: normalizeProduct(raw.product),
    size: raw.size || 'L',
    quantity: Number(raw.quantity ?? 1),
  };
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  console.log('Fetching to:', API_BASE_URL);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `HTTP Error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All Categories') {
    query.set('category', params.category);
  }
  if (params.search) {
    query.set('search', params.search);
  }
  const qs = query.toString() ? `?${query.toString()}` : '';
  const result = await apiRequest(`/products${qs}`, { method: 'GET' });
  const list = Array.isArray(result.data)
    ? result.data
    : Array.isArray(result)
    ? result
    : [];
  return list.map(normalizeProduct);
}

export async function fetchProductById(id) {
  const result = await apiRequest(`/products/${id}`, { method: 'GET' });
  return normalizeProduct(result.data || result);
}

export async function registerUser({ name, email, password }) {
  const result = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (result.token) {
    setAuthSession(result.token, result.user, result.role || result.user?.role);
  }
  return result;
}

export async function loginUser({ email, password }) {
  const result = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (result.token) {
    setAuthSession(result.token, result.user, result.role || result.user?.role);
  }
  return result;
}

export async function logoutUser() {
  try {
    await apiRequest('/logout', { method: 'POST' });
  } finally {
    clearAuthSession();
  }
}

export async function fetchCartItems() {
  const result = await apiRequest('/cart', { method: 'GET' });
  const list = Array.isArray(result.data) ? result.data : [];
  return list.map(normalizeCartItem).filter((item) => item && item.product);
}

export async function addToCartApi({ product_id, size = 'M', quantity = 1 }) {
  const result = await apiRequest('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id, size, quantity }),
  });
  return normalizeCartItem(result.data);
}

export async function updateCartItemApi(cartId, quantity) {
  const result = await apiRequest(`/cart/${cartId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
  return normalizeCartItem(result.data);
}

export async function removeCartItemApi(cartIdOrProductId, size) {
  const qs = size ? `?size=${encodeURIComponent(size)}` : '';
  return apiRequest(`/cart/${cartIdOrProductId}${qs}`, {
    method: 'DELETE',
  });
}

export async function clearCartApi() {
  return apiRequest('/cart', {
    method: 'DELETE',
  });
}

export async function checkoutOrderApi(payload) {
  return apiRequest('/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchOrdersApi() {
  const result = await apiRequest('/orders', {
    method: 'GET',
  });
  return Array.isArray(result.data) ? result.data : [];
}
