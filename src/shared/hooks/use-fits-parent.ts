'use client';

import { useCallback, useState } from 'react';

/**
 * Whether an element's content fits its parent's content box, re-checked when the parent resizes
 * (rotation, font loading, a longer locale). Measures `scrollWidth`, so it stays correct while the
 * element itself is visually hidden.
 */
export function useFitsParent<T extends HTMLElement>() {
  const [fits, setFits] = useState(true);
  const ref = useCallback((el: T | null) => {
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const check = () => {
      const style = getComputedStyle(parent);
      const padding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      setFits(el.scrollWidth <= parent.clientWidth - padding);
    };
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(check);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);
  return [ref, fits] as const;
}
