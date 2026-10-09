'use client';

import { useState } from 'react';
import { isNegative, subtractMoney } from '@/shared/lib/money';

/**
 * How many times `value` grew since mount: a key that restarts a one-shot animation. Adjusted while
 * rendering (React's "storing information from previous renders"), so there is no extra effect pass.
 */
export function usePulseOnIncrease(value: string): number {
  const [state, setState] = useState({ prev: value, count: 0 });
  if (state.prev !== value) {
    const grew = isNegative(subtractMoney(state.prev, value));
    setState({ prev: value, count: grew ? state.count + 1 : state.count });
  }
  return state.count;
}
