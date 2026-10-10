import { describe, expect, it } from 'vitest';
import { nextPayment, nextPaymentWindow } from './next-payment';

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

describe('nextPaymentWindow', () => {
  it('starts at the start date before the first payment and spans one month', () => {
    expect(nextPaymentWindow(notStarted)).toEqual({ from: '2026-10-15', to: '2026-11-14' });
  });

  it('is the month after the last generated payment', () => {
    expect(nextPaymentWindow(running)).toEqual({ from: '2026-11-01', to: '2026-11-30' });
  });

  it('every day in the window is its own next payment', () => {
    for (const rule of [notStarted, running]) {
      const { from, to } = nextPaymentWindow(rule);
      for (let d = new Date(`${from}T00:00`); ; d.setDate(d.getDate() + 1)) {
        const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (v > to) break;
        expect(nextPayment(d.getDate(), rule)).toBe(v);
      }
    }
  });
});
