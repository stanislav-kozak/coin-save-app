import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/shared/i18n/routing';
import { getLoginRedirect, getSignedInRedirect } from '@/shared/lib/route-access';

const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // `session` is the backend's 30-day hint that a refresh session exists (spec §5.2/§5.6).
  // `access` is accepted too while sessions created before the hint cookie existed are still alive.
  const hasSession = request.cookies.has('session') || request.cookies.has('access');
  const { pathname } = request.nextUrl;
  const target =
    getLoginRedirect(pathname, hasSession) ?? getSignedInRedirect(pathname, hasSession);
  if (target) return NextResponse.redirect(new URL(target, request.url));
  return intl(withoutBrowserLanguage(request));
}

/**
 * The browser's language is not a choice: drop it so next-intl falls back to the user's cookie
 * (set by the language switcher) or English, instead of guessing from Accept-Language.
 */
function withoutBrowserLanguage(request: NextRequest): NextRequest {
  if (!request.headers.has('accept-language')) return request;
  const headers = new Headers(request.headers);
  headers.delete('accept-language');
  return new NextRequest(request, { headers });
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
