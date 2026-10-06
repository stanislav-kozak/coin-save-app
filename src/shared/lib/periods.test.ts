import { describe, expect, it } from 'vitest';
import { currentMonth, dayKey, recentDays } from './periods';

describe('periods', () => {
  const now = new Date(2026, 9, 6, 15, 30);
  it('starts the month as a local calendar date (the analytics API truncates timestamps to UTC days)', () => {
    // Local midnight 1 Oct in Kyiv is 30 Sep 21:00Z — as a timestamp the backend would pull in 30 Sep.
    const { from, to } = currentMonth(now);
    expect(from).toBe('2026-10-01');
    expect(new Date(to)).toEqual(now);
  });

  it('runs in the Kyiv timezone', () => {
    expect(new Date(2026, 9, 1).getTimezoneOffset()).toBe(-180);
  });
  it('spans the last N local days including today', () => {
    expect(new Date(recentDays(now, 3).from)).toEqual(new Date(2026, 9, 4, 0, 0));
  });
  it('keys a date by its local calendar day', () => {
    expect(dayKey(new Date(2026, 9, 6, 23, 30))).toBe('2026-10-06');
    expect(dayKey(new Date(2026, 9, 7, 0, 5))).toBe('2026-10-07');
  });
});
