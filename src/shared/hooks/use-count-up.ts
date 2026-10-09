'use client';

import { useEffect, useRef, useState } from 'react';

const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A money string that counts from its previous value to the new one (ease-out), for display only:
 * frames go through Number(), the last frame is `value` itself. Not animated on first render or
 * with reduced motion.
 */
export function useCountUp(value: string, durationMs = 400): string {
  const [frame, setFrame] = useState<string | null>(null);
  const shown = useRef(value);

  useEffect(() => {
    const from = shown.current;
    if (from === value || reducedMotion()) {
      shown.current = value;
      return;
    }
    const a = Number(from);
    const b = Number(value);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      if (t < 1) {
        const current = (a + (b - a) * (1 - (1 - t) ** 3)).toFixed(2);
        shown.current = current;
        setFrame(current);
        raf = requestAnimationFrame(tick);
      } else {
        shown.current = value;
        setFrame(null);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return frame ?? value;
}
