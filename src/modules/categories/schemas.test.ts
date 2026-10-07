import { describe, expect, it } from 'vitest';
import { categoryFormSchema } from './schemas';

const ok = { name: 'Кафе', icon: '☕', color: '#ec4999' };

describe('categoryFormSchema', () => {
  it('treats an empty limit as no limit and parses "1 000,50"', () => {
    expect(categoryFormSchema.parse({ ...ok, monthlyLimit: '' }).monthlyLimit).toBeNull();
    expect(categoryFormSchema.parse({ ...ok, monthlyLimit: '1 000,50' }).monthlyLimit).toBe(1000.5);
  });

  it('rejects zero, negative and malformed limits', () => {
    for (const v of ['0', '-5', '1.23456', 'abc']) {
      expect(categoryFormSchema.safeParse({ ...ok, monthlyLimit: v }).success).toBe(false);
    }
  });

  it('needs a name up to 100 characters', () => {
    expect(categoryFormSchema.safeParse({ ...ok, name: ' ', monthlyLimit: '' }).success).toBe(
      false,
    );
    expect(
      categoryFormSchema.safeParse({ ...ok, name: 'x'.repeat(101), monthlyLimit: '' }).success,
    ).toBe(false);
  });
});
