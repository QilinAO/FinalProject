// D:\ProJectFinal\Lasts\my-project\src\services\authService.js
import apiService from './api';

const ACCESS_TOKEN_KEY = 'access_token';
const LEGACY_TOKEN_KEY = 'authToken';
const USER_PROFILE_KEY = 'user_profile';

function lsGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, val); } catch {}
}
function lsRemove(key) {
  try { localStorage.removeItem(key); } catch {}
}

export function getAccessToken() {
  const v = lsGet(ACCESS_TOKEN_KEY);
  if (v) return v;
  const legacy = lsGet(LEGACY_TOKEN_KEY);
  return legacy || '';
}

export function setAccessToken(token) {
  if (token) {
    lsSet(ACCESS_TOKEN_KEY, token);
    lsRemove(LEGACY_TOKEN_KEY);
  } else {
    lsRemove(ACCESS_TOKEN_KEY);
    lsRemove(LEGACY_TOKEN_KEY);
  }
}

export function isAuthenticated() {
  return !!getAccessToken();
}

export function setAuthUser(profile) {
  if (profile) {
    lsSet(USER_PROFILE_KEY, JSON.stringify(profile));
  } else {
    lsRemove(USER_PROFILE_KEY);
  }
}

export function getAuthUser() {
  const raw = lsGet(USER_PROFILE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getStoredUserProfile() {
  return getAuthUser();
}

export async function loginUser(identifierOrEmail, password) {
  try {
    const payload = identifierOrEmail?.includes('@')
      ? { email: identifierOrEmail, password }
      : { identifier: identifierOrEmail, password };
    const res = await apiService.post('/auth/signin', payload);
    const token = res?.token || res?.access_token;
    const profile = res?.profile;

    if (!token || !profile) throw new Error('การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง');

    setAccessToken(token);
    setAuthUser(profile);

    return { profile };
  } catch (err) {
    setAccessToken('');
    setAuthUser(null);
    throw err;
  }
}

export function signupUser(userData) {
  return apiService.post('/auth/signup', userData);
}

export async function signoutUser() {
  try { await apiService.post('/auth/signout'); } catch {}
  setAccessToken('');
  setAuthUser(null);
}

export async function logout() {
  await signoutUser();
}

export default {
  getAccessToken,
  setAccessToken,
  isAuthenticated,
  setAuthUser,
  getAuthUser,
  getStoredUserProfile,
  loginUser,
  signupUser,
  signoutUser,
  logout,
};
