import { describe, expect, it } from 'vitest';
import { createWalletSchema } from './schemas';

const base = { color: '#3b82f6', name: 'Mono', currency: 'UAH' };
const parse = (initialBalance: string) => createWalletSchema.safeParse({ ...base, initialBalance });

describe('createWalletSchema', () => {
  it('accepts a comma decimal and turns it into a number', () => {
    expect(parse('1250,50').data?.initialBalance).toBe(1250.5);
  });
  it('treats an empty balance as zero', () => {
    expect(parse('').data?.initialBalance).toBe(0);
  });
  it('accepts negative balances', () => {
    expect(parse('-45').data?.initialBalance).toBe(-45);
  });
  it.each([
    ['abc', 'amountInvalid'],
    ['1.23456', 'amountInvalid'],
    ['1000000001', 'amountTooLarge'],
    ['-1000000001', 'amountTooLarge'],
  ])('rejects %s', (value, message) => {
    expect(parse(value).error?.issues[0]?.message).toBe(message);
  });
  it('trims and requires the name', () => {
    expect(
      createWalletSchema.safeParse({ ...base, name: '  ', initialBalance: '0' }).error?.issues[0]
        ?.message,
    ).toBe('nameRequired');
  });
});
