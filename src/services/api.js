// D:\ProJectFinal\Lasts\my-project\src\services\api.js
import { getAccessToken, signoutUser } from './authService';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
const DEV_USER_ID = import.meta.env.VITE_DEV_USER_ID || '';

export class ApiHttpError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status || 0;
    this.payload = payload ?? null;
  }
}

function buildUrl(base, endpoint, query) {
  const url = new URL((endpoint || '').replace(/^\/+/, ''), (base.endsWith('/') ? base : base + '/') );
  if (query && typeof query === 'object') {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) v.forEach(item => qs.append(k, String(item)));
      else qs.set(k, String(v));
    }
    const s = qs.toString();
    if (s) url.search = s;
  }
  return url.toString();
}

async function parseBody(res, asBlob = false) {
  if (asBlob) return await res.blob();
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

function composeSignal(userSignal, timeoutMs) {
  const controller = new AbortController();
  let timer = null;
  if (timeoutMs && Number.isFinite(timeoutMs)) {
    timer = setTimeout(() => controller.abort(), timeoutMs);
  }
  if (userSignal) {
    if (userSignal.aborted) controller.abort();
    else userSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return { signal: controller.signal, cleanup: () => { if (timer) clearTimeout(timer); } };
}

class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this._onUnauthorized = null;
  }

  setOnUnauthorized(handler) {
    this._onUnauthorized = typeof handler === 'function' ? handler : null;
  }

  _headers(extra = {}, body) {
    const headers = { Accept: 'application/json', ...extra };
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    // ไม่ตั้ง Content-Type สำหรับ FormData เพราะ browser จะตั้งเองพร้อม boundary
    if (!isForm && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

    const token = getAccessToken?.();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    else if (DEV_USER_ID) headers['x-user-id'] = DEV_USER_ID;

    return headers;
  }

  async request(method, endpoint, body = null, options = {}) {
    const {
      headers: extraHeaders,
      query,
      signal,
      timeoutMs = 15000,
      responseType, // 'blob'
      credentials = 'include',
    } = options;

    const url = buildUrl(this.baseURL, endpoint, query);
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    const wantsBlob = responseType === 'blob';

    const { signal: finalSignal, cleanup } = composeSignal(signal, timeoutMs);

    const fetchOptions = {
      method,
      headers: this._headers(extraHeaders, body),
      signal: finalSignal,
      credentials,
    };
    if (body != null) fetchOptions.body = isForm ? body : JSON.stringify(body);

    let res;
    try {
      res = await fetch(url, fetchOptions);
    } catch (err) {
      cleanup();
      const isAbort = err?.name === 'AbortError';
      throw new ApiHttpError(isAbort ? 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง' : 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 0, { cause: err });
    }

    cleanup();

    if (res.status === 204) return null;

    const data = await parseBody(res, wantsBlob);

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        try { this._onUnauthorized?.(); } catch {}
        try { await signoutUser?.(); } catch {}
        try { if (typeof window !== 'undefined') window.location.href = '/login'; } catch {}
        throw new ApiHttpError('เซสชันหมดอายุหรือไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่', res.status, data);
      }
      const msg =
        (data && typeof data === 'object' && (data.error || data.message)) ||
        (typeof data === 'string' ? data : null) ||
        `HTTP ${res.status} ${res.statusText}`;
      throw new ApiHttpError(msg, res.status, data);
    }

    return data;
  }

  get(endpoint, options = {}) { return this.request('GET', endpoint, null, options); }
  post(endpoint, body, options = {}) { return this.request('POST', endpoint, body, options); }
  put(endpoint, body, options = {}) { return this.request('PUT', endpoint, body, options); }
  patch(endpoint, body, options = {}) { return this.request('PATCH', endpoint, body, options); }
  delete(endpoint, options = {}) { return this.request('DELETE', endpoint, null, options); }

  download(endpoint, options = {}) {
    return this.get(endpoint, { ...options, responseType: 'blob' });
  }
}

const apiService = new ApiService(API_BASE_URL);
export default apiService;
export { ApiService };
