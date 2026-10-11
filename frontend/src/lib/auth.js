/**
 * GapFill Authentication & Cloud Database Sync Client
 */

const TOKEN_KEY = 'gapfill_auth_token_v1';
const USER_KEY = 'gapfill_auth_user_v1';
const API_BASE = '/api';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to save token to localStorage', e);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error('Failed to save user to localStorage', e);
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthHeaders() {
  const token = getStoredToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function registerAPI(payload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  return data;
}

export async function verifyOtpAPI(email, otp) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'OTP verification failed');
  }
  if (data.token) {
    setStoredToken(data.token);
    setStoredUser(data.user);
  }
  return data;
}

export async function resendOtpAPI(email) {
  const res = await fetch(`${API_BASE}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to resend OTP');
  }
  return data;
}

export async function loginAPI(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok && !data.requires_otp) {
    throw new Error(data.error || 'Login failed');
  }
  if (data.token) {
    setStoredToken(data.token);
    setStoredUser(data.user);
  }
  return data;
}

export async function fetchCurrentUserAPI() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      setStoredUser(data.user);
      return data.user;
    } else if (res.status === 401) {
      clearAuth();
      return null;
    }
  } catch (e) {
    console.warn('Unable to reach /api/auth/me', e);
  }
  return getStoredUser();
}

export async function fetchUserStudyDataAPI() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/user/sync`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (e) {
    console.warn('Backend /api/user/sync unreachable', e);
  }
  return null;
}

export async function syncUserStudyDataAPI(studyData) {
  const token = getStoredToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_BASE}/user/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ data: studyData })
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to sync study state to cloud database', e);
    return false;
  }
}
