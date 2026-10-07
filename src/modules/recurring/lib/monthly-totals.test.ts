import { describe, expect, it } from 'vitest';
import { monthlyTotals } from './monthly-totals';

describe('monthlyTotals', () => {
  it('sums active rules per currency, exactly', () => {
    expect(
      monthlyTotals([
        { amount: '249', currency: 'UAH', active: true },
        { amount: '0.1', currency: 'USD', active: true },
        { amount: '199.5', currency: 'UAH', active: true },
        { amount: '0.2', currency: 'USD', active: true },
        { amount: '1000', currency: 'UAH', active: false },
      ]),
    ).toEqual([
      { currency: 'UAH', amount: '448.50' },
      { currency: 'USD', amount: '0.30' },
    ]);
    expect(monthlyTotals([])).toEqual([]);
  });
});
