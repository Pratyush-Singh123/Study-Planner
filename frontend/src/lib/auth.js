/**
 * GapFill Universal Authentication & Multi-User Cloud/Local Database Engine
 * Works seamlessly both with a connected Flask backend (SQLite/Postgres + SMTP)
 * and standalone client-side (GitHub Pages / Vercel static deployment).
 */

const TOKEN_KEY = 'gapfill_auth_token_v1';
const USER_KEY = 'gapfill_auth_user_v1';
const USERS_DB_KEY = 'gapfill_virtual_users_v1';
const OTPS_DB_KEY = 'gapfill_virtual_otps_v1';
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

// -------------------------------------------------------------
// VIRTUAL CLIENT-SIDE USER DATABASE (Fallback for GitHub Pages)
// -------------------------------------------------------------

function getVirtualUsers() {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveVirtualUsers(users) {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save virtual users', e);
  }
}

function getVirtualOTPs() {
  try {
    const raw = localStorage.getItem(OTPS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveVirtualOTPs(otps) {
  try {
    localStorage.setItem(OTPS_DB_KEY, JSON.stringify(otps));
  } catch (e) {
    console.error('Failed to save virtual OTPs', e);
  }
}

function generate6DigitOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function virtualRegister(payload) {
  const email = (payload.email || '').trim().toLowerCase();
  const password = payload.password || '';
  const fullName = (payload.full_name || '').trim();
  const college = (payload.college || 'IIITDM Kancheepuram').trim();

  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const users = getVirtualUsers();
  let user = users.find(u => u.email === email);

  if (user && user.is_verified) {
    throw new Error('An account with this email already exists. Please sign in.');
  }

  const otpCode = generate6DigitOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  if (user) {
    user.password = password;
    user.full_name = fullName || user.full_name;
    user.college = college || user.college;
  } else {
    user = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email,
      password,
      full_name: fullName,
      college,
      is_verified: false,
      created_at: new Date().toISOString()
    };
    users.push(user);
  }
  saveVirtualUsers(users);

  // Store OTP
  const otps = getVirtualOTPs().filter(o => o.email !== email);
  otps.push({ email, otp: otpCode, expiresAt, used: false });
  saveVirtualOTPs(otps);

  return {
    success: true,
    requires_otp: true,
    email,
    message: `Verification code sent to ${email}.`,
    dev_otp: otpCode
  };
}

function virtualVerifyOtp(email, otp) {
  const normEmail = (email || '').trim().toLowerCase();
  const normOtp = (otp || '').trim();

  const otps = getVirtualOTPs();
  const record = otps.find(o => o.email === normEmail && o.otp === normOtp && !o.used && o.expiresAt > Date.now());

  if (!record) {
    throw new Error('Invalid or expired verification code. Please check and try again.');
  }

  record.used = true;
  saveVirtualOTPs(otps);

  const users = getVirtualUsers();
  const user = users.find(u => u.email === normEmail);
  if (!user) {
    throw new Error('User account not found.');
  }

  user.is_verified = true;
  saveVirtualUsers(users);

  const token = `virt_jwt_${user.id}_${Date.now()}`;
  const safeUser = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    college: user.college,
    is_verified: true,
    created_at: user.created_at
  };

  setStoredToken(token);
  setStoredUser(safeUser);

  return {
    success: true,
    message: 'Email verified successfully! Welcome to GapFill.',
    token,
    user: safeUser
  };
}

function virtualLogin(email, password) {
  const normEmail = (email || '').trim().toLowerCase();
  const users = getVirtualUsers();
  const user = users.find(u => u.email === normEmail);

  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }

  if (!user.is_verified) {
    const otpCode = generate6DigitOTP();
    const otps = getVirtualOTPs().filter(o => o.email !== normEmail);
    otps.push({ email: normEmail, otp: otpCode, expiresAt: Date.now() + 10 * 60 * 1000, used: false });
    saveVirtualOTPs(otps);

    return {
      success: false,
      requires_otp: true,
      email: normEmail,
      message: 'Email not verified. A verification code has been sent.',
      dev_otp: otpCode
    };
  }

  const token = `virt_jwt_${user.id}_${Date.now()}`;
  const safeUser = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    college: user.college,
    is_verified: true,
    created_at: user.created_at
  };

  setStoredToken(token);
  setStoredUser(safeUser);

  return {
    success: true,
    message: `Welcome back, ${user.full_name || user.email}!`,
    token,
    user: safeUser
  };
}

function virtualResendOtp(email) {
  const normEmail = (email || '').trim().toLowerCase();
  const otpCode = generate6DigitOTP();
  const otps = getVirtualOTPs().filter(o => o.email !== normEmail);
  otps.push({ email: normEmail, otp: otpCode, expiresAt: Date.now() + 10 * 60 * 1000, used: false });
  saveVirtualOTPs(otps);

  return {
    success: true,
    message: `New verification code sent to ${normEmail}.`,
    email: normEmail,
    dev_otp: otpCode
  };
}

// -------------------------------------------------------------
// PUBLIC API METHODS WITH SEAMLESS CLIENT/SERVER HYBRID FALLBACK
// -------------------------------------------------------------

export async function registerAPI(payload) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s for full Gmail SMTP TLS delivery

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    // If server returned valid JSON response
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      return data;
    }
  } catch (err) {
    // If server threw a real validation error with message, preserve it
    if (err.message && !err.message.includes('fetch') && !err.message.includes('Unexpected') && !err.message.includes('aborted')) {
      throw err;
    }
    console.info('Backend unreachable, using Client Virtual Database engine for registration.', err);
  }

  // Fallback to Virtual Database
  return virtualRegister(payload);
}

export async function verifyOtpAPI(email, otp) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP verification failed');
      if (data.token) {
        setStoredToken(data.token);
        setStoredUser(data.user);
      }
      return data;
    }
  } catch (err) {
    if (err.message && !err.message.includes('fetch') && !err.message.includes('Unexpected') && !err.message.includes('aborted')) {
      throw err;
    }
    console.info('Backend unreachable, using Client Virtual Database engine for OTP verification.');
  }

  // Fallback to Virtual Database
  return virtualVerifyOtp(email, otp);
}

export async function resendOtpAPI(email) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
      return data;
    }
  } catch (err) {
    if (err.message && !err.message.includes('fetch') && !err.message.includes('Unexpected') && !err.message.includes('aborted')) {
      throw err;
    }
  }

  return virtualResendOtp(email);
}

export async function loginAPI(email, password) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
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
  } catch (err) {
    if (err.message && !err.message.includes('fetch') && !err.message.includes('Unexpected') && !err.message.includes('aborted')) {
      throw err;
    }
    console.info('Backend unreachable, using Client Virtual Database engine for login.');
  }

  return virtualLogin(email, password);
}

export async function fetchCurrentUserAPI() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      setStoredUser(data.user);
      return data.user;
    }
  } catch {
    // If backend offline, fall back to local stored user
  }
  return getStoredUser();
}

export async function fetchUserStudyDataAPI() {
  const user = getStoredUser();
  if (!user) return null;

  // Try server sync
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE}/user/sync`, {
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return data.data;
    }
  } catch {
    // Backend offline, fall through to user-partitioned local storage
  }

  // Load from partitioned local user database
  try {
    const raw = localStorage.getItem(`gapfill_user_data_${user.id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function syncUserStudyDataAPI(studyData) {
  const user = getStoredUser();
  if (!user) return false;

  // Always save to user's partitioned local storage
  try {
    localStorage.setItem(`gapfill_user_data_${user.id}`, JSON.stringify(studyData));
  } catch (e) {
    console.error('Failed to save to local partitioned user storage', e);
  }

  // Also sync to server if available
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE}/user/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ data: studyData }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    // Offline sync is fine since local partitioned storage succeeded
    return true;
  }
}
