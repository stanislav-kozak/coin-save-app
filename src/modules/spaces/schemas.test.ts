import { describe, expect, it } from 'vitest';
import { createSpaceSchema } from './schemas';

const message = (r: { error?: { issues: { message: string }[] } }) => r.error?.issues[0]?.message;

describe('createSpaceSchema', () => {
  it('trims the name', () => {
    expect(createSpaceSchema.parse({ name: '  Family ', currency: 'UAH' }).name).toBe('Family');
  });
  it('requires a non-blank name', () => {
    expect(message(createSpaceSchema.safeParse({ name: '   ', currency: 'UAH' }))).toBe(
      'nameRequired',
    );
  });
  it('caps the name at 100 characters', () => {
    expect(message(createSpaceSchema.safeParse({ name: 'x'.repeat(101), currency: 'UAH' }))).toBe(
      'nameTooLong',
    );
  });
  it('accepts only supported currencies', () => {
    expect(createSpaceSchema.safeParse({ name: 'A', currency: 'XYZ' }).success).toBe(false);
  });
});
