export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export function getAdminHeaders() {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('veloreka_token') ||
    '';

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function ensureAdminAuthToken() {
  const existing =
    localStorage.getItem('token') || localStorage.getItem('veloreka_token');

  if (existing && !existing.startsWith('offline-token-')) {
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', existing);
    }
    return existing;
  }

  console.log('Fetching to:', API_BASE_URL);
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@veloreka.com',
      password: '123',
    }),
  });

  if (response.ok) {
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('veloreka_token', data.token);
      localStorage.setItem('role', data.role || 'admin');
      localStorage.setItem('veloreka_role', data.role || 'admin');
      return data.token;
    }
  }

  return existing || '';
}

export async function adminFetch(endpoint, options = {}) {
  await ensureAdminAuthToken();

  console.log('Fetching to:', API_BASE_URL);
  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('veloreka_token');
    await ensureAdminAuthToken();

    console.log('Fetching to:', API_BASE_URL);
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        ...(options.headers || {}),
      },
    });
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || `Gagal memuat data dari server (HTTP ${response.status})`
    );
  }

  return result;
}
