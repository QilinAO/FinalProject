import { lazy } from 'react';

// A small helper to mitigate transient Vite/HMR fetch hiccups for dynamic imports
export default function lazyWithRetry(factory, retries = 1, delayMs = 150) {
  return lazy(async () => {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Try to load the module
        const mod = await factory();
        return mod;
      } catch (err) {
        lastErr = err;
        const message = String(err?.message || err);
        const isFetchFail = message.includes('Failed to fetch dynamically imported module');

        // Retry fetch-related failures a couple times; on final failure, do a hard reload
        if (isFetchFail) {
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, delayMs));
            continue;
          }
          // Do NOT auto-reload to avoid infinite reload loops; surface error instead
        }
        throw err;
      }
    }
    throw lastErr;
  });
}
