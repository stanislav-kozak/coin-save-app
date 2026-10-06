import { describe, expect, it } from 'vitest';
import { SUPPORTED_CURRENCIES, currencyLabel } from './currencies';

describe('currencies', () => {
  it('matches the backend list with UAH first', () => {
    expect(SUPPORTED_CURRENCIES[0]).toBe('UAH');
    expect([...SUPPORTED_CURRENCIES].sort()).toEqual([
      'AUD',
      'CAD',
      'CHF',
      'CZK',
      'EUR',
      'GBP',
      'JPY',
      'PLN',
      'RON',
      'RUB',
      'TRY',
      'UAH',
      'USD',
    ]);
  });

  it('labels a currency with its localized, capitalized name', () => {
    expect(currencyLabel('UAH', 'uk')).toBe('UAH — Українська гривня');
    expect(currencyLabel('EUR', 'en')).toBe('EUR — Euro');
  });
});
