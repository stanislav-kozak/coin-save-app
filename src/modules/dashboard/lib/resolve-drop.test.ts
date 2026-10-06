import { describe, expect, it } from 'vitest';
import { resolveDrop } from './resolve-drop';

describe('resolveDrop', () => {
  it('maps a wallet dropped on a category', () => {
    expect(resolveDrop('wallet:w1', 'category:c9')).toEqual({ walletId: 'w1', categoryId: 'c9' });
  });
  it.each([
    ['wallet:w1', null],
    ['wallet:w1', 'wallet:w2'],
    [null, 'category:c9'],
    ['category:c1', 'category:c9'],
    ['wallet:', 'category:c9'],
  ])('ignores %s → %s', (active, over) => {
    expect(resolveDrop(active, over)).toBeNull();
  });
});
