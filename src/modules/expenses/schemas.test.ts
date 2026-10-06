import { describe, expect, it } from 'vitest';
import { createExpenseSchema } from './schemas';

const parse = (amount: string, note = '') =>
  createExpenseSchema.safeParse({ walletId: 'w1', categoryId: 'c1', amount, note });

describe('createExpenseSchema', () => {
  it.each([
    ['1 250,50', 1250.5],
    ['340', 340],
    ['0.0001', 0.0001],
  ])('accepts %s', (input, expected) => {
    expect(parse(input).data?.amount).toBe(expected);
  });
  it.each([
    ['', 'amountRequired'],
    ['0', 'amountPositive'],
    ['-5', 'amountInvalid'],
    ['1.23456', 'amountInvalid'],
    ['abc', 'amountInvalid'],
    ['1000000001', 'amountTooLarge'],
  ])('rejects %s', (input, message) => {
    expect(parse(input).error?.issues[0]?.message).toBe(message);
  });
  it('limits the note to 500 characters and drops a blank one', () => {
    expect(parse('1', 'x'.repeat(501)).error?.issues[0]?.message).toBe('noteTooLong');
    expect(parse('1', '   ').data?.note).toBeUndefined();
  });
});
