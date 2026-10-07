import { describe, expect, it } from 'vitest';
import { nextMonthStart } from './next-month-start';

describe('nextMonthStart', () => {
  it('is the 1st of the following local month, rolling over the year', () => {
    expect(nextMonthStart(new Date(2026, 0, 31, 23, 30))).toBe('2026-02-01');
    expect(nextMonthStart(new Date(2026, 11, 15))).toBe('2027-01-01');
  });
});
