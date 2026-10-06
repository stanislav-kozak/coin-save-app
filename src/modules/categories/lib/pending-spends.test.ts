import { describe, expect, it } from 'vitest';
import { pendingByCategory } from './pending-spends';

const analytics = {
  currency: 'UAH',
  expenses: [
    { walletCurrency: 'USD', fxRate: '40', occurredAt: '2026-10-01T10:00:00Z' },
    { walletCurrency: 'USD', fxRate: '41.5', occurredAt: '2026-10-05T10:00:00Z' },
    { walletCurrency: 'UAH', fxRate: '1', occurredAt: '2026-10-06T10:00:00Z' },
  ],
};

describe('pendingByCategory', () => {
  it('adds same-currency expenses exactly', () => {
    const totals = pendingByCategory(
      [
        { categoryId: 'c1', amount: '0.1', currency: 'UAH' },
        { categoryId: 'c1', amount: '0.2', currency: 'UAH' },
      ],
      analytics,
    );
    expect(totals.get('c1')).toBe('0.30');
  });

  it('converts another currency at its latest known rate', () => {
    const totals = pendingByCategory(
      [{ categoryId: 'c1', amount: '2', currency: 'USD' }],
      analytics,
    );
    expect(totals.get('c1')).toBe('83.00');
  });

  it('leaves a currency without a known rate to the server', () => {
    const totals = pendingByCategory(
      [{ categoryId: 'c1', amount: '2', currency: 'EUR' }],
      analytics,
    );
    expect(totals.has('c1')).toBe(false);
  });
});
