'use client';

import { useCurrentUser } from '../api/use-current-user';

/**
 * Validates the session on app pages that don't fetch anything yet. Without it, a `session` cookie
 * that outlived its server-side session would keep bouncing /login to an empty home page.
 * Remove once the app shell loads the current user itself.
 */
export function SessionCheck() {
  useCurrentUser();
  return null;
}
