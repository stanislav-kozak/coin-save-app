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

it('does not slide a saved row in again when it replaces its optimistic placeholder', () => {
  const placeholder = (id: string) => id.startsWith('optimistic-');
  const { result, rerender } = renderHook(({ ids }) => useNewIds(ids, placeholder), {
    initialProps: { ids: ['a', 'b'] as string[] | undefined },
  });
  rerender({ ids: ['optimistic-1', 'a', 'b'] });
  expect([...result.current]).toEqual(['optimistic-1']);
  rerender({ ids: ['e9', 'a', 'b'] }); // the server's id for the same expense
  expect([...result.current]).toEqual([]);
  rerender({ ids: ['e10', 'e9', 'a', 'b'] }); // a genuinely new one (e.g. from another device)
  expect([...result.current]).toEqual(['e10']);
});
