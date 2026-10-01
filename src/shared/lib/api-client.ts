import createClient from 'openapi-fetch';
import type { paths } from '@/generated/api';
import { routing } from '@/shared/i18n/routing';
import { createRefreshingFetch } from './refreshing-fetch';

type Options = {
  baseUrl?: string;
  onAuthFailure: () => void;
  fetchImpl?: (input: Request) => Promise<Response>;
};

export function createApiClient({ baseUrl = '', onAuthFailure, fetchImpl }: Options) {
  return createClient<paths>({
    baseUrl,
    fetch: createRefreshingFetch({
      refreshUrl: `${baseUrl}/api/auth/refresh`,
      onAuthFailure,
      fetchImpl,
    }),
  });
}

function redirectToLogin() {
  const first = window.location.pathname.split('/')[1];
  const locale = (routing.locales as readonly string[]).includes(first)
    ? first
    : routing.defaultLocale;
  // Deliberate full reload: the session is gone, so drop all client state (query cache, sockets).
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/${locale}/login`);
}

/** Browser client: same-origin `/api/*`, proxied to the backend by next.config rewrites. */
export const api = createApiClient({ onAuthFailure: redirectToLogin });
