import { describe, expect, it } from 'vitest';
import { limitStatus } from './limit-status';

describe('limitStatus (spec §10.4)', () => {
  it.each([
    [0, '2000', 'ok'],
    [79, '2000', 'ok'],
    [80, '2000', 'warning'],
    [99, '2000', 'warning'],
    [100, '2000', 'over'],
    [120, '2000', 'over'],
    [50, null, 'none'],
  ] as const)('pct %s with limit %s → %s', (pct, limit, expected) => {
    expect(limitStatus(pct, limit)).toBe(expected);
  });
});
