'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(min-width: 768px)'; // Tailwind `md`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** True at the `md` breakpoint and up; false during SSR. */
export function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
