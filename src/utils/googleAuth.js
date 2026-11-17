import {
  API_BASE_URL,
  authenticateWithGoogleApi,
  getGoogleAuthRedirectUrl,
  setAuthSession,
} from '../services/api';

const GOOGLE_OAUTH_RESULT_KEY = 'veloreka_google_oauth_result';
const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function loadGoogleIdentityScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google.accounts.oauth2);
      return;
    }

    const existing = document.querySelector(`script[src="${GIS_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.google?.accounts?.oauth2) {
          resolve(window.google.accounts.oauth2);
        } else {
          reject(new Error('Google Identity Services failed to initialize.'));
        }
      });
      existing.addEventListener('error', () =>
        reject(new Error('Unable to load Google Identity Services script.'))
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        resolve(window.google.accounts.oauth2);
      } else {
        reject(new Error('Google Identity Services failed to initialize.'));
      }
    };
    script.onerror = () =>
      reject(new Error('Unable to load Google Identity Services script.'));
    document.head.appendChild(script);
  });
}

export function handleGoogleCallbackParams() {
  if (typeof window === 'undefined') return null;

  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(
    window.location.hash.replace(/^#/, '')
  );

  const errorParam =
    searchParams.get('error') ||
    searchParams.get('google_error') ||
    hashParams.get('error');

  if (errorParam) {
    const errorMessage =
      errorParam === 'access_denied' || errorParam === 'google_cancelled'
        ? 'Google sign-in was cancelled. Please select a Google account to continue.'
        : decodeURIComponent(errorParam);

    const payload = {
      type: 'VELOREKA_GOOGLE_AUTH_ERROR',
      message: errorMessage,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(GOOGLE_OAUTH_RESULT_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage error
    }

    if (window.opener && window.opener !== window) {
      window.opener.postMessage(payload, window.location.origin);
      window.close();
      return { isPopup: true, error: errorMessage };
    }

    window.history.replaceState({}, document.title, window.location.pathname);
    return { error: errorMessage };
  }

  const token =
    searchParams.get('token') ||
    searchParams.get('auth_token') ||
    hashParams.get('token');

  if (!token) {
    return null;
  }

  const resolvedRole = searchParams.get('role') || 'user';
  const email = searchParams.get('email') || '';
  const name =
    searchParams.get('name') ||
    (email ? email.split('@')[0] : 'Google Account User');
  const id = searchParams.get('id') || undefined;

  const userData = {
    id,
    fullName: name,
    name,
    email,
    role: resolvedRole,
    token,
    apiBaseUrl: API_BASE_URL,
  };

  setAuthSession(token, userData, resolvedRole);

  const payload = {
    type: 'VELOREKA_GOOGLE_AUTH_SUCCESS',
    token,
    role: resolvedRole,
    user: userData,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(GOOGLE_OAUTH_RESULT_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage error
  }

  if (window.opener && window.opener !== window) {
    window.opener.postMessage(payload, window.location.origin);
    window.close();
    return { isPopup: true, userData };
  }

  window.history.replaceState({}, document.title, window.location.pathname);
  return { userData };
}

export async function triggerGoogleSelectAccount({
  onSuccess,
  onError,
  onLoadingChange,
}) {
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

  onLoadingChange?.(true);

  try {
    localStorage.removeItem(GOOGLE_OAUTH_RESULT_KEY);
  } catch {
    // Ignore storage error
  }

  // 1. Frontend Google OAuth 2.0 (Google Identity Services) with prompt: 'select_account'
  if (clientId) {
    try {
      const oauth2 = await loadGoogleIdentityScript();
      const tokenClient = oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: async (tokenResponse) => {
          if (tokenResponse?.error) {
            onLoadingChange?.(false);
            onError?.(
              tokenResponse.error === 'access_denied'
                ? 'Google sign-in was cancelled. Please select a Google account to continue.'
                : tokenResponse.error_description ||
                    'Google authentication failed. Please try again.'
            );
            return;
          }

          const accessToken = tokenResponse?.access_token;
          if (!accessToken) {
            onLoadingChange?.(false);
            onError?.(
              'No authentication token received from Google. Please try again.'
            );
            return;
          }

          try {
            const profileRes = await fetch(
              'https://www.googleapis.com/oauth2/v3/userinfo',
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (!profileRes.ok) {
              throw new Error('Failed to verify Google account profile.');
            }

            const profile = await profileRes.json();
            if (!profile?.email) {
              throw new Error(
                'Unable to retrieve email address from selected Google account.'
              );
            }

            let finalToken = accessToken;
            let finalRole = 'user';
            let backendUser = null;

            try {
              const backendRes = await authenticateWithGoogleApi({
                access_token: accessToken,
                email: profile.email,
                name: profile.name || profile.given_name || profile.email,
                google_id: profile.sub,
                avatar: profile.picture,
              });
              if (backendRes?.token) {
                finalToken = backendRes.token;
                finalRole =
                  backendRes.role || backendRes.user?.role || 'user';
                backendUser = backendRes.user;
              }
            } catch {
              // Use verified Google OAuth access_token if backend /auth/google is not reachable
            }

            const userData = {
              id: backendUser?.id || profile.sub,
              fullName:
                backendUser?.name ||
                profile.name ||
                profile.given_name ||
                profile.email.split('@')[0],
              email: backendUser?.email || profile.email,
              avatar: profile.picture,
              role: finalRole,
              token: finalToken,
              apiBaseUrl: API_BASE_URL,
            };

            setAuthSession(finalToken, userData, finalRole);
            onLoadingChange?.(false);
            onSuccess?.(userData);
          } catch (verifyErr) {
            onLoadingChange?.(false);
            onError?.(
              verifyErr.message ||
                'Failed to verify Google account. Please try again.'
            );
          }
        },
        error_callback: (err) => {
          onLoadingChange?.(false);
          if (err?.type === 'popup_closed') {
            onError?.(
              'Google sign-in was cancelled because the account chooser popup was closed.'
            );
          } else if (err?.type === 'popup_failed_to_open') {
            onError?.(
              'Google sign-in popup was blocked by your browser. Please allow popups and try again.'
            );
          } else {
            onError?.(
              err?.message ||
                'Google sign-in was cancelled or failed. Please try again.'
            );
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (err) {
      onLoadingChange?.(false);
      onError?.(
        err.message || 'Unable to start Google sign-in. Please try again.'
      );
      return;
    }
  }

  // 2. Backend Laravel Socialite OAuth 2.0 (/auth/google/redirect?prompt=select_account)
  const redirectUrl = getGoogleAuthRedirectUrl();
  const width = 520;
  const height = 640;
  const left = Math.max(
    0,
    Math.round(window.screenX + (window.outerWidth - width) / 2)
  );
  const top = Math.max(
    0,
    Math.round(window.screenY + (window.outerHeight - height) / 2)
  );

  const popup = window.open(
    redirectUrl,
    'VelorekaGoogleSelectAccount',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
  );

  if (!popup) {
    // If browser blocked the popup, redirect current window to backend OAuth endpoint
    window.location.assign(redirectUrl);
    return;
  }

  let settled = false;

  const cleanup = () => {
    settled = true;
    window.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', handleStorage);
    clearInterval(pollTimer);
  };

  const processResultPayload = (payload) => {
    if (!payload || settled) return;

    if (payload.type === 'VELOREKA_GOOGLE_AUTH_SUCCESS' && payload.token) {
      cleanup();
      try {
        localStorage.removeItem(GOOGLE_OAUTH_RESULT_KEY);
      } catch {
        // Ignore
      }
      const resolvedRole = payload.role || payload.user?.role || 'user';
      const userData = {
        ...payload.user,
        role: resolvedRole,
        token: payload.token,
        apiBaseUrl: API_BASE_URL,
      };
      setAuthSession(payload.token, userData, resolvedRole);
      onLoadingChange?.(false);
      onSuccess?.(userData);
      return;
    }

    if (payload.type === 'VELOREKA_GOOGLE_AUTH_ERROR') {
      cleanup();
      try {
        localStorage.removeItem(GOOGLE_OAUTH_RESULT_KEY);
      } catch {
        // Ignore
      }
      onLoadingChange?.(false);
      onError?.(
        payload.message ||
          'Google sign-in was cancelled or failed. Please try again.'
      );
    }
  };

  const handleMessage = (event) => {
    if (event.origin !== window.location.origin) return;
    processResultPayload(event.data);
  };

  const handleStorage = (event) => {
    if (event.key !== GOOGLE_OAUTH_RESULT_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue);
      processResultPayload(parsed);
    } catch {
      // Ignore invalid JSON
    }
  };

  window.addEventListener('message', handleMessage);
  window.addEventListener('storage', handleStorage);

  const pollTimer = setInterval(() => {
    if (settled) return;

    try {
      const storedRaw = localStorage.getItem(GOOGLE_OAUTH_RESULT_KEY);
      if (storedRaw) {
        const parsed = JSON.parse(storedRaw);
        processResultPayload(parsed);
        if (settled) return;
      }
    } catch {
      // Ignore
    }

    if (popup.closed) {
      cleanup();
      onLoadingChange?.(false);
      onError?.(
        'Google sign-in was cancelled or the account chooser popup was closed. Please select a Google account to continue.'
      );
    }
  }, 300);
}
