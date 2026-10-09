'use client';

import { useState } from 'react';

type State = { key: string | null; seen: Set<string> | null; fresh: Set<string> };

/**
 * Ids that appeared after the first list was shown (to animate their arrival). The first list and a
 * repeat of the same list mark nothing new. Adjusted while rendering, like usePulseOnIncrease.
 */
export function useNewIds(ids: string[] | undefined): Set<string> {
  const [state, setState] = useState<State>({ key: null, seen: null, fresh: new Set() });
  const key = ids ? ids.join(',') : null;
  if (ids && key !== state.key) {
    const fresh = state.seen
      ? new Set(ids.filter((id) => !state.seen!.has(id)))
      : new Set<string>();
    setState({ key, seen: new Set([...(state.seen ?? []), ...ids]), fresh });
  }
  return state.fresh;
}
