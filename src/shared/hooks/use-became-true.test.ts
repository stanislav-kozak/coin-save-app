import { renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';
import { useBecameTrue } from './use-became-true';

it('is true only after a change to true during the session', () => {
  const already = renderHook(({ f }) => useBecameTrue(f), { initialProps: { f: true } });
  expect(already.result.current).toBe(false);
  const { result, rerender } = renderHook(({ f }) => useBecameTrue(f), {
    initialProps: { f: false },
  });
  rerender({ f: true });
  expect(result.current).toBe(true);
  rerender({ f: false });
  expect(result.current).toBe(false);
});
