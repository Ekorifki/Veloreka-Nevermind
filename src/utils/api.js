import { API_BASE_URL, buildApiUrl, apiRequest } from '../services/api';

export { API_BASE_URL, buildApiUrl, apiRequest };

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

  try {
    const loginUrl = buildApiUrl('/login');
    console.log('Fetching to:', loginUrl);
    const response = await fetch(loginUrl, {
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
  } catch (err) {
    console.error('ensureAdminAuthToken error:', err);
  }

  return existing || '';
}

export async function adminFetch(endpoint, options = {}) {
  await ensureAdminAuthToken();
  return apiRequest(endpoint, options);
}
