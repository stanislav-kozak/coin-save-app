import { describe, expect, it } from 'vitest';
import { currentMonth, dayKey, recentDays, userTimeZone } from './periods';

describe('periods', () => {
  const now = new Date(2026, 9, 6, 15, 30);

  it('runs in the Kyiv timezone', () => {
    expect(new Date(2026, 9, 1).getTimezoneOffset()).toBe(-180);
    // ICU may report the legacy alias; the backend's IsTimeZone accepts both spellings.
    expect(userTimeZone()).toMatch(/^Europe\/Ki(y|e)v$/);
  });

  it('spans the current month as inclusive local calendar dates', () => {
    expect(currentMonth(now)).toEqual({ from: '2026-10-01', to: '2026-10-06' });
  });

  it('spans the last N local days including today', () => {
    expect(recentDays(now, 3)).toEqual({ from: '2026-10-04', to: '2026-10-06' });
  });

  it('keys a date by its local calendar day', () => {
    expect(dayKey(new Date(2026, 9, 6, 23, 30))).toBe('2026-10-06');
    expect(dayKey(new Date(2026, 9, 7, 0, 5))).toBe('2026-10-07');
  });
});
