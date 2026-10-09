import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountUp } from './use-count-up';

let reduce = false;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce') }));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  reduce = false;
});

describe('useCountUp', () => {
  it('shows the value as is on first render', () => {
    const { result } = renderHook(() => useCountUp('100'));
    expect(result.current).toBe('100');
  });

  it('counts towards a new value and ends exactly on it', () => {
    const { result, rerender } = renderHook(({ v }) => useCountUp(v), {
      initialProps: { v: '100' },
    });
    rerender({ v: '200' });
    act(() => vi.advanceTimersByTime(200));
    const mid = Number(result.current);
    expect(mid).toBeGreaterThan(100);
    expect(mid).toBeLessThan(200);
    act(() => vi.advanceTimersByTime(400));
    expect(result.current).toBe('200');
  });

  it('ends on the latest value when changed again mid-way', () => {
    const { result, rerender } = renderHook(({ v }) => useCountUp(v), {
      initialProps: { v: '100' },
    });
    rerender({ v: '200' });
    act(() => vi.advanceTimersByTime(100));
    rerender({ v: '150.5' });
    act(() => vi.advanceTimersByTime(600));
    expect(result.current).toBe('150.5');
  });

  it('jumps straight to the value with reduced motion', () => {
    reduce = true;
    const { result, rerender } = renderHook(({ v }) => useCountUp(v), {
      initialProps: { v: '100' },
    });
    rerender({ v: '200' });
    expect(result.current).toBe('200');
  });
});

describe('useCountUp — no flashes', () => {
  it('keeps showing the old value until the first frame, then counts', () => {
    const { result, rerender } = renderHook(({ v }) => useCountUp(v), {
      initialProps: { v: '100' },
    });
    rerender({ v: '200' });
    expect(result.current).toBe('100'); // never the target first, then a jump back
  });

  it('never goes below where it started', () => {
    const { result, rerender } = renderHook(({ v }) => useCountUp(v), {
      initialProps: { v: '0' },
    });
    rerender({ v: '50' });
    for (let i = 0; i < 30; i++) {
      act(() => vi.advanceTimersByTime(16));
      expect(Number(result.current)).toBeGreaterThanOrEqual(0);
    }
    expect(result.current).toBe('50');
  });

  it('jumps without counting when the currency (key) changes', () => {
    const { result, rerender } = renderHook(({ v, k }) => useCountUp(v, k), {
      initialProps: { v: '1000', k: 'UAH' },
    });
    rerender({ v: '24.10', k: 'USD' });
    expect(result.current).toBe('24.10');
  });
});
