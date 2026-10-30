/** Registers public/sw.js (the offline page; needed for installing the app). Production only. */
export function registerServiceWorker() {
  if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker
    .register('/sw.js', { scope: '/', updateViaCache: 'none' })
    .catch(() => {}); // without it the app works as a plain website
}
