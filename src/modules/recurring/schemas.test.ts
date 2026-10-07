import { describe, expect, it } from 'vitest';
import { recurringFormSchema } from './schemas';

const base = {
  type: 'EXPENSE' as const,
  name: ' Netflix ',
  amount: '249',
  walletId: 'w1',
  categoryId: '',
  dayOfMonth: '15',
  endDate: '',
  note: '',
};

describe('recurringFormSchema', () => {
  it('normalises the form into what the API takes', () => {
    expect(recurringFormSchema.parse(base)).toMatchObject({
      name: 'Netflix',
      amount: 249,
      dayOfMonth: 15,
      categoryId: null,
      endDate: null,
    });
  });

  it('needs a name and a day between 1 and 31', () => {
    const noName = recurringFormSchema.safeParse({ ...base, name: ' ' });
    expect(noName.error?.issues[0]).toMatchObject({ path: ['name'], message: 'nameRequired' });
    expect(recurringFormSchema.safeParse({ ...base, dayOfMonth: '32' }).success).toBe(false);
    expect(recurringFormSchema.safeParse({ ...base, dayOfMonth: '0' }).success).toBe(false);
  });
});
