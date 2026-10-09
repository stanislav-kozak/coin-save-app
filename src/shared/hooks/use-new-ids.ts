'use client';

import { useState } from 'react';

type State = {
  key: string | null;
  seen: Set<string> | null;
  last: string[];
  fresh: Set<string>;
};

/**
 * Ids that appeared after the first list was shown (to animate their arrival). The first list and a
 * repeat of the same list mark nothing new. A real id that takes the place of a vanished placeholder
 * (an optimistic row the server just confirmed) isn't new either: that row already arrived.
 * Adjusted while rendering, like usePulseOnIncrease.
 */
export function useNewIds(
  ids: string[] | undefined,
  isPlaceholder: (id: string) => boolean = () => false,
): Set<string> {
  const [state, setState] = useState<State>({
    key: null,
    seen: null,
    last: [],
    fresh: new Set(),
  });
  const key = ids ? ids.join(',') : null;
  if (ids && key !== state.key) {
    const fresh = new Set<string>();
    if (state.seen) {
      let replaced = state.last.filter((id) => isPlaceholder(id) && !ids.includes(id)).length;
      for (const id of ids) {
        if (state.seen.has(id)) continue;
        if (!isPlaceholder(id) && replaced > 0) {
          replaced -= 1;
          continue;
        }
        fresh.add(id);
      }
    }
    setState({ key, seen: new Set([...(state.seen ?? []), ...ids]), last: ids, fresh });
  }
  return state.fresh;
}
