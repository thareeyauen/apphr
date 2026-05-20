// API client for apphr-backend.

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
const TOKEN_KEY = 'apphr-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function api(method, path, body) {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = 'request failed';
    try { msg = (await res.json()).error || msg; } catch { /* noop */ }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function apiLogin(email, password) {
  const { token, user } = await api('POST', '/auth/login', { email, password });
  setToken(token);
  return user;
}

export async function apiMe() {
  return await api('GET', '/auth/me').then((r) => r?.user || null);
}

export async function apiGetCurrentProfile() {
  // Server returns the full profile incl. documents for /api/users/:id
  // when called with the bearer token. We resolve id via /auth/me.
  const me = await apiMe();
  if (!me) return null;
  return await api('GET', `/users/${me.id}`);
}

export async function apiUpdateCurrentUser(patch) {
  const me = await apiMe();
  if (!me) throw new Error('not signed in');
  return await api('PATCH', `/users/${me.id}`, patch);
}

export async function apiChangePassword(currentPassword, newPassword) {
  const me = await apiMe();
  if (!me) throw new Error('not signed in');
  return await api('PATCH', `/users/${me.id}/password`, { currentPassword, newPassword });
}

export async function apiGetRequests(options = {}) {
  const params = new URLSearchParams();
  if (options.scope) params.set('scope', options.scope);
  if (options.all) params.set('all', '1');
  const qs = params.toString();
  return await api('GET', `/requests${qs ? `?${qs}` : ''}`);
}
export async function apiCreateRequest(body) {
  return await api('POST', '/requests', body);
}
export async function apiUpdateRequestStatus(id, status) {
  return await api('PATCH', `/requests/${id}`, { status });
}
export async function apiDeleteRequest(id) {
  return await api('DELETE', `/requests/${id}`);
}

export async function apiGetCheckins(options = {}) {
  const params = new URLSearchParams();
  if (options.scope) params.set('scope', options.scope);
  if (options.all) params.set('all', '1');
  const qs = params.toString();
  return await api('GET', `/checkins${qs ? `?${qs}` : ''}`);
}
export async function apiCreateCheckin(body) {
  return await api('POST', '/checkins', body);
}
export async function apiUpdateCheckin(id, patch) {
  return await api('PATCH', `/checkins/${id}`, patch);
}
export async function apiDeleteCheckin(id) {
  return await api('DELETE', `/checkins/${id}`);
}
