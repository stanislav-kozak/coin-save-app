import { expect, it } from 'vitest';
import { monthLimits } from './month-limits';

const cat = (
  monthlyLimit: string | null,
  currency: 'EUR' | 'UAH' | null = null,
  archived = false,
) => ({ monthlyLimit, currency, archived });

it('adds space-currency limits as they are', () => {
  expect(monthLimits([cat('3000'), cat('1000', 'UAH'), cat(null)], 'UAH', new Map(), [])).toEqual({
    total: '4000.00',
    approximate: false,
    excluded: false,
  });
});

it("converts own-currency limits at today's rate and marks the total approximate", () => {
  expect(monthLimits([cat('3000'), cat('50', 'EUR')], 'UAH', new Map([['EUR', '45']]), [])).toEqual(
    { total: '5250.00', approximate: true, excluded: false },
  );
});

it('skips limits whose rate failed and says so', () => {
  expect(monthLimits([cat('3000'), cat('50', 'EUR')], 'UAH', new Map(), ['EUR'])).toEqual({
    total: '3000.00',
    approximate: true,
    excluded: true,
  });
});

it('has no total without limits; archived ones do not count', () => {
  expect(monthLimits([cat(null), cat('500', null, true)], 'UAH', new Map(), [])).toEqual({
    total: null,
    approximate: false,
    excluded: false,
  });
});
