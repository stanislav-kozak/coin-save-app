import { renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';
import { useNewIds } from './use-new-ids';

it('marks only ids that appear after the first list', () => {
  const { result, rerender } = renderHook(({ ids }) => useNewIds(ids), {
    initialProps: { ids: undefined as string[] | undefined },
  });
  rerender({ ids: ['a', 'b'] });
  expect([...result.current]).toEqual([]);
  rerender({ ids: ['c', 'a', 'b'] });
  expect([...result.current]).toEqual(['c']);
  rerender({ ids: ['c', 'a', 'b'] }); // the same list again: nothing new
  expect([...result.current]).toEqual(['c']);
});
