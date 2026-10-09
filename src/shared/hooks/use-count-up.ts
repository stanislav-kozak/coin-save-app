'use client';

import { useEffect, useState } from 'react';

const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

type Anim = { key: string; target: string; from: string; shown: string };

/**
 * A money string that counts from its previous value to the new one (ease-out), for display only:
 * frames go through Number(), the last frame is `value` itself. Not animated on first render, with
 * reduced motion, or when `key` (the currency) changes — the old number means nothing in the new one.
 * The change is adopted while rendering, so the first paint after it still shows the old value.
 */
export function useCountUp(value: string, key = '', durationMs = 400): string {
  const [anim, setAnim] = useState<Anim>({ key, target: value, from: value, shown: value });

  if (anim.key !== key || (anim.target !== value && reducedMotion())) {
    setAnim({ key, target: value, from: value, shown: value });
  } else if (anim.target !== value) {
    setAnim({ key, target: value, from: anim.shown, shown: anim.shown });
  }

  const { from, target } = anim;
  useEffect(() => {
    if (from === target) return;
    const a = Number(from);
    const b = Number(target);
    let start: number | null = null;
    let raf = 0;
    const tick = (now: number) => {
      start ??= now; // the first frame's own clock: never a negative t (no dip below `from`)
      const t = Math.min(1, (now - start) / durationMs);
      const shown = t < 1 ? (a + (b - a) * (1 - (1 - t) ** 3)).toFixed(2) : target;
      setAnim((s) => (s.target === target ? { ...s, shown } : s));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, target, durationMs]);

  return anim.shown;
}
