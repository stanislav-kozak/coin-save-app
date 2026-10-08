import { describe, expect, it } from 'vitest';
import {
  addMoney,
  formatMoney,
  isNegative,
  multiplyMoney,
  percentOf,
  splitPercent,
  subtractMoney,
} from './money';

describe('money', () => {
  it('formats decimal strings without float artefacts', () => {
    expect(formatMoney('8240.5', 'USD', 'en')).toBe('$8,240.50');
    expect(formatMoney('999999999.9999', 'USD', 'en')).toBe('$1,000,000,000.00');
    expect(formatMoney('0.1', 'USD', 'en')).toBe('$0.10');
    expect(formatMoney('-45', 'USD', 'en')).toBe('-$45.00');
    expect(formatMoney('0', 'EUR', 'en')).toBe('€0.00');
  });
  it('uses currency symbols like the design, not ISO codes', () => {
    expect(formatMoney('8240.5', 'UAH', 'uk')).toMatch(/^8\s240,50\s₴$/);
    expect(formatMoney('0', 'EUR', 'uk')).toMatch(/^0,00\s€$/);
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
  it('adds exactly', () => {
    expect(addMoney('0.1', '0.2')).toBe('0.30');
    expect(addMoney('-50', '45.5')).toBe('-4.50');
  });
  it('multiplies by a rate, rounded half-up to 4 places like the server Decimal(19, 4)', () => {
    expect(multiplyMoney('5', '41.2345')).toBe('206.1725');
    expect(multiplyMoney('0.3333', '0.5')).toBe('0.1667');
    expect(multiplyMoney('10', '1')).toBe('10.00');
    // FX rates come with more places than amounts: they must not be cut to 4 first.
    expect(multiplyMoney('1000', '0.024134')).toBe('24.134');
    expect(multiplyMoney('-1000', '0.02413456')).toBe('-24.1346');
  });
  it('computes a rounded percentage like the server', () => {
    expect(percentOf('1995', '2000')).toBe(100);
    expect(percentOf('1', '3')).toBe(33);
    expect(percentOf('2', '3')).toBe(67);
    expect(percentOf('5', '0')).toBe(0);
  });

  it('splits a total into whole percents that add up to exactly 100', () => {
    expect(splitPercent(['1', '1', '1'])).toEqual([34, 33, 33]);
    expect(splitPercent(['400', '200', '150', '120', '80', '50'])).toEqual([40, 20, 15, 12, 8, 5]);
    expect(splitPercent(['0.01', '999.99'])).toEqual([0, 100]);
    expect(splitPercent(['0', '0'])).toEqual([0, 0]);
  });
});
