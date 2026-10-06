import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/shared/i18n/routing';
import { getLoginRedirect } from '@/shared/lib/route-access';

const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // Presence check only (spec §5.6) — no API call on the edge.
  const hasSession = request.cookies.has('access');
  const target = getLoginRedirect(request.nextUrl.pathname, hasSession);
  if (target) return NextResponse.redirect(new URL(target, request.url));
  return intl(request);
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
