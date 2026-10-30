import { describe, expect, it } from 'vitest';
import { nextPayment } from './next-payment';

const notStarted = { startDate: '2026-10-15T00:00:00.000Z', lastGeneratedAt: null };
const running = {
  startDate: '2026-09-05T00:00:00.000Z',
  lastGeneratedAt: '2026-10-05T00:00:00.000Z',
};

describe('nextPayment', () => {
  it('is the first occurrence of the day on or after the start, before the first payment', () => {
    expect(nextPayment(15, notStarted)).toBe('2026-10-15');
    expect(nextPayment(20, notStarted)).toBe('2026-10-20');
    expect(nextPayment(10, notStarted)).toBe('2026-11-10');
  });

  it('is in the month after the last generated payment', () => {
    expect(nextPayment(5, running)).toBe('2026-11-05');
    expect(nextPayment(20, running)).toBe('2026-11-20'); // October is already paid
  });

  it('clamps 29–31 to short months', () => {
    expect(nextPayment(31, { startDate: '2027-02-01', lastGeneratedAt: null })).toBe('2027-02-28');
  });
});
