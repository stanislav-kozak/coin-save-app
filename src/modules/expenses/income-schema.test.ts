import { describe, expect, it } from 'vitest';
import { incomeSchema } from './income-schema';

describe('incomeSchema', () => {
  it('needs a name only when monthly', () => {
    expect(
      incomeSchema.safeParse({ amount: '15 000', note: '', monthly: false, name: '' }).success,
    ).toBe(true);
    const r = incomeSchema.safeParse({ amount: '15000', note: '', monthly: true, name: ' ' });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0]).toMatchObject({ path: ['name'], message: 'nameRequired' });
  });
});
