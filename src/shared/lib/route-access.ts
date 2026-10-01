import { routing } from '@/shared/i18n/routing';

export const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/styleguide',
] as const;

const locales: readonly string[] = routing.locales;

/** Where to send a request that has no session, or null if it may proceed. */
export function getLoginRedirect(pathname: string, hasSession: boolean): string | null {
  if (hasSession) return null;

  const segments = pathname.split('/').filter(Boolean);
  const hasLocale = segments.length > 0 && locales.includes(segments[0]);
  const locale = hasLocale ? segments[0] : routing.defaultLocale;
  const path = '/' + (hasLocale ? segments.slice(1) : segments).join('/');

  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
  return isPublic ? null : `/${locale}/login`;
}
