import createClient from 'openapi-fetch';
import type { paths } from '@/generated/api';
import { createRefreshingFetch } from './refreshing-fetch';
import { getLoginRedirect } from './route-access';

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

type LocationLike = Pick<Location, 'pathname' | 'assign'>;

/** Session is gone: go to the login of the current locale — unless we're already on a public page. */
export function redirectToLogin(location: LocationLike) {
  const target = getLoginRedirect(location.pathname, false);
  if (!target) return;
  // Deliberate full reload: the session is gone, so drop all client state (query cache, sockets).
  location.assign(target);
}

/** Browser client: same-origin `/api/*`, proxied to the backend by next.config rewrites. */
export const api = createApiClient({ onAuthFailure: () => redirectToLogin(window.location) });
