import { describe, expect, it } from 'vitest';
import { firstPaymentDate } from './first-payment-date';

describe('firstPaymentDate', () => {
  it('is this month when the day is still ahead, else next month (today counts as past)', () => {
    expect(firstPaymentDate(15, new Date(2026, 9, 7))).toBe('2026-10-15');
    expect(firstPaymentDate(15, new Date(2026, 9, 15))).toBe('2026-11-15');
    expect(firstPaymentDate(5, new Date(2026, 9, 7))).toBe('2026-11-05');
  });

  it('clamps to the last day of short months and rolls over the year', () => {
    expect(firstPaymentDate(31, new Date(2026, 1, 15))).toBe('2026-02-28');
    expect(firstPaymentDate(31, new Date(2028, 0, 31))).toBe('2028-02-29');
    expect(firstPaymentDate(10, new Date(2026, 11, 20))).toBe('2027-01-10');
  });
});
