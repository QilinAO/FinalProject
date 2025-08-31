// D:\ProJectFinal\Lasts\my-project\src\utils\errorReporter.js
// รวมตัวช่วยส่ง client error ไปแบ็กเอนด์ + ติด global handlers

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

function postJSON(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    credentials: 'omit',
  }).catch(() => {});
}

export function reportClientError(payload = {}) {
  const safe = {
    level: payload.level || 'error',
    message: String(payload.message || 'Unknown client error'),
    stack: payload.stack ? String(payload.stack).slice(0, 8000) : null,
    url: payload.url || (typeof location !== 'undefined' ? location.href : null),
    route: payload.route || null,
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    meta: payload.meta || null,
    ts: new Date().toISOString(),
  };
  return postJSON(`${API_BASE_URL}/client-logs`, safe);
}

export function initGlobalErrorHandlers(getRoute) {
  // error จาก runtime (throw)
  window.onerror = (message, source, lineno, colno, error) => {
    reportClientError({
      message: `${message} @${source}:${lineno}:${colno}`,
      stack: error?.stack || null,
      route: typeof getRoute === 'function' ? getRoute() : null,
      level: 'error',
    });
  };

  // error จาก promise ที่ไม่มี catch
  window.onunhandledrejection = (event) => {
    const reason = event?.reason;
    reportClientError({
      message: (reason && (reason.message || reason.toString())) || 'Unhandled rejection',
      stack: reason?.stack || null,
      route: typeof getRoute === 'function' ? getRoute() : null,
      level: 'error',
    });
  };
}
