import { routing } from '@/shared/i18n/routing';

export const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/check-email',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/styleguide',
  // An email link: it must keep its token while signed out (the page sends to login itself).
  '/invitations/accept',
] as const;

/** Pages that make no sense once signed in. Email-link pages (verify, reset) are deliberately absent. */
export const GUEST_ONLY_PATHS = ['/login', '/signup', '/forgot-password', '/check-email'] as const;

const locales: readonly string[] = routing.locales;

function splitLocale(pathname: string): { locale: string; path: string } {
  const segments = pathname.split('/').filter(Boolean);
  const hasLocale = segments.length > 0 && locales.includes(segments[0]);
  return {
    locale: hasLocale ? segments[0] : routing.defaultLocale,
    path: '/' + (hasLocale ? segments.slice(1) : segments).join('/'),
  };
}

function matches(path: string, list: readonly string[]): boolean {
  return list.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Where to send a request that has no session, or null if it may proceed. */
export function getLoginRedirect(pathname: string, hasSession: boolean): string | null {
  if (hasSession) return null;
  const { locale, path } = splitLocale(pathname);
  return matches(path, PUBLIC_PATHS) ? null : `/${locale}/login`;
}

/** Where to send a signed-in user who opened a guest-only page, or null. */
export function getSignedInRedirect(pathname: string, hasSession: boolean): string | null {
  if (!hasSession) return null;
  const { locale, path } = splitLocale(pathname);
  return matches(path, GUEST_ONLY_PATHS) ? `/${locale}` : null;
}
