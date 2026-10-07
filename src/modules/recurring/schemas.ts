import { z } from 'zod';
import { amountField, noteField } from '@/shared/lib/form-fields';

// Messages are keys of `recurring.validation`.
export const recurringFormSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME']),
  name: z.string().trim().min(1, { error: 'nameRequired' }).max(100, { error: 'nameTooLong' }),
  amount: amountField,
  walletId: z.string().min(1, { error: 'walletRequired' }),
  categoryId: z.string().transform((v) => v || null),
  dayOfMonth: z.coerce.number().int().min(1).max(31),
  endDate: z.string().transform((v) => v || null),
  note: noteField,
});

export type RecurringFormValues = z.output<typeof recurringFormSchema>;
export type RecurringFormInput = z.input<typeof recurringFormSchema>;
