import { z } from 'zod';
import { amountField, noteField } from './schemas';

// Messages are keys of `expenses.validation`.
export const incomeSchema = z
  .object({
    amount: amountField,
    note: noteField,
    monthly: z.boolean(),
    name: z.string().trim().max(100, { error: 'nameTooLong' }),
  })
  // A recurring transaction needs a name (spec §4.5), a one-off income doesn't.
  .superRefine((v, ctx) => {
    if (v.monthly && !v.name)
      ctx.addIssue({ code: 'custom', path: ['name'], message: 'nameRequired' });
  });

export type IncomeDraft = z.output<typeof incomeSchema>;
export type IncomeFormInput = z.input<typeof incomeSchema>;
