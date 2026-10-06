import { describe, expect, it } from 'vitest';
import { limitStatus } from './limit-status';

describe('limitStatus (spec §10.4)', () => {
  it.each([
    ['0', '2000', 0, 'ok'],
    ['1580', '2000', 79, 'ok'],
    ['1600', '2000', 80, 'warning'],
    ['1990', '2000', 99, 'warning'],
    // The backend rounds pct: 1995/2000 → 100, yet the limit isn't reached.
    ['1995', '2000', 100, 'warning'],
    ['2000', '2000', 100, 'over'],
    ['2400.10', '2000', 120, 'over'],
    ['50', null, 0, 'none'],
  ] as const)('spent %s of limit %s (pct %s) → %s', (spent, limit, pct, expected) => {
    expect(limitStatus(spent, limit, pct)).toBe(expected);
  });
});
