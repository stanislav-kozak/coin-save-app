import { describe, expect, it } from 'vitest';
import { resolveReorder } from './resolve-reorder';

const ids = ['a', 'b', 'c'];

describe('resolveReorder', () => {
  it('moves a category to where it was dropped', () => {
    expect(resolveReorder('category:a', 'category:c', ids)).toEqual(['b', 'c', 'a']);
    expect(resolveReorder('category:c', 'category:a', ids)).toEqual(['c', 'a', 'b']);
  });

  it('ignores wallet drags, drops on itself and drops outside', () => {
    expect(resolveReorder('wallet:w1', 'category:a', ids)).toBeNull();
    expect(resolveReorder('category:a', 'category:a', ids)).toBeNull();
    expect(resolveReorder('category:a', null, ids)).toBeNull();
  });
});
