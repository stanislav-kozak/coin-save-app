'use client';

import { useState } from 'react';
import { isNegative, subtractMoney } from '@/shared/lib/money';

/**
 * How many times `value` grew since mount (within one `key`, e.g. a currency): a key that restarts a one-shot animation. Adjusted while
 * rendering (React's "storing information from previous renders"), so there is no extra effect pass.
 */
export function usePulseOnIncrease(value: string, key = ''): number {
  const [state, setState] = useState({ prev: value, key, count: 0 });
  if (state.prev !== value || state.key !== key) {
    // A different currency (key) isn't growth: the numbers aren't comparable.
    const grew = state.key === key && isNegative(subtractMoney(state.prev, value));
    setState({ prev: value, key, count: grew ? state.count + 1 : state.count });
  }
  return state.count;
}
