import { describe, expect, it } from 'vitest';
import { currentMonth, dayKey, recentDays } from './periods';

describe('periods', () => {
  const now = new Date(2026, 9, 6, 15, 30);
  it('spans the current local month up to now', () => {
    const { from, to } = currentMonth(now);
    expect(new Date(from)).toEqual(new Date(2026, 9, 1, 0, 0));
    expect(new Date(to)).toEqual(now);
  });
  it('spans the last N local days including today', () => {
    expect(new Date(recentDays(now, 3).from)).toEqual(new Date(2026, 9, 4, 0, 0));
  });
  it('keys a date by its local calendar day', () => {
    expect(dayKey(new Date(2026, 9, 6, 23, 30))).toBe('2026-10-06');
    expect(dayKey(new Date(2026, 9, 7, 0, 5))).toBe('2026-10-07');
  });
});
