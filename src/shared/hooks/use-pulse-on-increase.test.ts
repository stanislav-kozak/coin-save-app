import { renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';
import { usePulseOnIncrease } from './use-pulse-on-increase';

it('pulses only when the amount grows after mount', () => {
  const { result, rerender } = renderHook(({ v }) => usePulseOnIncrease(v), {
    initialProps: { v: '100' },
  });
  expect(result.current).toBe(0);
  rerender({ v: '150' });
  expect(result.current).toBe(1);
  rerender({ v: '120' }); // an edit down: no pulse
  expect(result.current).toBe(1);
  rerender({ v: '200' });
  expect(result.current).toBe(2);
});
