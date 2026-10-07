import { describe, expect, it } from 'vitest';
import { keysFor, REALTIME_EVENTS } from './invalidation-map';

describe('keysFor (spec §8.5)', () => {
  it('maps each event to the space-scoped keys it makes stale', () => {
    expect(keysFor('wallet.changed', 's1')).toEqual([
      ['wallets', 's1'],
      ['expenses', 's1'],
    ]);
    expect(keysFor('category.changed', 's1')).toEqual([
      ['categories', 's1'],
      ['analytics', 's1'],
    ]);
    expect(keysFor('expense.changed', 's1')).toEqual([
      ['expenses', 's1'],
      ['wallets', 's1'],
      ['analytics', 's1'],
    ]);
    expect(keysFor('recurring.changed', 's1')).toEqual([['recurring', 's1']]);
    expect(keysFor('space.changed', 's1')).toEqual([
      ['spaces'],
      ['members', 's1'],
      ['invitations', 's1'],
    ]);
    expect(keysFor('member.joined', 's1')).toEqual([
      ['members', 's1'],
      ['invitations', 's1'],
    ]);
  });

  it('lists every event the client listens to', () => {
    expect(REALTIME_EVENTS).toHaveLength(6);
  });
});
