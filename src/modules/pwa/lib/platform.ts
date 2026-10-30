/**
 * Where the app runs, for the install instructions:
 * - `ios`: Safari and every other iOS browser (Share → Add to Home Screen); iPadOS reports a Mac
 *   with touch;
 * - `android`: any Android browser; Chrome and Samsung prompt, others use the browser menu;
 * - `desktop-safari`: macOS Safari (File → Add to Dock);
 * - `desktop`: Chromium on a computer (installs via the prompt or the address bar);
 * - `unsupported`: desktop Firefox, which can't install web apps.
 */
export type Platform = 'ios' | 'android' | 'desktop-safari' | 'desktop' | 'unsupported';

export function detectPlatform(nav: { userAgent: string; maxTouchPoints?: number }): Platform {
  const ua = nav.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && (nav.maxTouchPoints ?? 0) > 1)) {
    return 'ios';
  }
  if (/Android/.test(ua)) return 'android';
  if (/Firefox\//.test(ua)) return 'unsupported';
  if (/Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\//.test(ua)) {
    return 'desktop-safari';
  }
  return 'desktop';
}

/** Running as the installed app (Android/desktop `display-mode`, iOS `navigator.standalone`). */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
