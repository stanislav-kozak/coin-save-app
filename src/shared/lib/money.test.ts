import { describe, expect, it } from 'vitest';
import { formatMoney, isNegative, subtractMoney } from './money';

describe('money', () => {
  it('formats decimal strings without float artefacts', () => {
    expect(formatMoney('8240.5', 'USD', 'en')).toBe('$8,240.50');
    expect(formatMoney('999999999.9999', 'USD', 'en')).toBe('$1,000,000,000.00');
    expect(formatMoney('0.1', 'USD', 'en')).toBe('$0.10');
    expect(formatMoney('-45', 'USD', 'en')).toBe('-$45.00');
    expect(formatMoney('0', 'EUR', 'en')).toBe('€0.00');
  });
  it('can force a sign for incomes/expenses', () => {
    expect(formatMoney('340', 'USD', 'en', { sign: 'always' })).toBe('+$340.00');
    expect(formatMoney('-340', 'USD', 'en', { sign: 'always' })).toBe('-$340.00');
  });
  it('subtracts exactly', () => {
    expect(subtractMoney('2400.10', '2000')).toBe('400.10');
    expect(subtractMoney('0.3', '0.1')).toBe('0.20');
    expect(subtractMoney('1', '2.5')).toBe('-1.50');
    expect(subtractMoney('10.12345', '0')).toBe('10.1234');
  });
  it('detects negatives', () => {
    expect(isNegative('-0.01')).toBe(true);
    expect(isNegative('0')).toBe(false);
    expect(isNegative('-0')).toBe(false);
  });
});
