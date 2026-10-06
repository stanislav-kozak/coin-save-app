import { describe, expect, it } from 'vitest';
import { groupByDay } from './group-by-day';

const now = new Date(2026, 9, 6, 23, 45);
const at = (d: number, h: number, m = 0) => ({
  occurredAt: new Date(2026, 9, d, h, m).toISOString(),
});

describe('groupByDay', () => {
  it('groups by local calendar day, newest first, labels today/yesterday', () => {
    const groups = groupByDay([at(5, 9), at(6, 23, 30), at(4, 12), at(6, 0, 5)], now);
    expect(groups.map((g) => [g.label, g.items.length])).toEqual([
      ['today', 2],
      ['yesterday', 1],
      ['date', 1],
    ]);
    expect(groups[0].items[0].occurredAt).toBe(at(6, 23, 30).occurredAt);
  });
});
