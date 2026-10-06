import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
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
  return intl(request);
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
