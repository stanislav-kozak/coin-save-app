'use client';

import { useState } from 'react';

/**
 * True from the render where `flag` turned true during the session (false while it already was on
 * mount): for a one-time "it just happened" animation. Adjusted while rendering.
 */
export function useBecameTrue(flag: boolean): boolean {
  const [state, setState] = useState({ prev: flag, became: false });
  if (state.prev !== flag) setState({ prev: flag, became: flag });
  return state.became;
}
