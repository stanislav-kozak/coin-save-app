import { z } from 'zod';
import { amountField, noteField } from '@/shared/lib/form-fields';

export { amountField, noteField };

export const createExpenseSchema = z.object({
  walletId: z.string().min(1, { error: 'walletRequired' }),
  categoryId: z.string().optional(),
  amount: amountField,
  note: noteField,
});

export type ExpenseDraft = z.output<typeof createExpenseSchema>;
export type ExpenseFormInput = z.input<typeof createExpenseSchema>;
