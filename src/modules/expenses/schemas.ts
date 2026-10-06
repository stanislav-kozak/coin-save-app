import { z } from 'zod';

const AMOUNT = /^\d+([.,]\d{1,4})?$/; // positive, ≤ 4 dp (server Decimal(19, 4))

// Messages are keys of `expenses.validation`.
export const createExpenseSchema = z.object({
  walletId: z.string().min(1),
  categoryId: z.string().optional(),
  amount: z
    .string()
    .transform((v) => v.replace(/\s/g, '').replace(',', '.'))
    .refine((v) => v !== '', { error: 'amountRequired', abort: true })
    .refine((v) => AMOUNT.test(v), { error: 'amountInvalid', abort: true })
    // ≤ 4 dp and ≤ 1e9 are exact enough as a JS number for the API's @IsNumber({ maxDecimalPlaces: 4 })
    .transform(Number)
    .refine((v) => v > 0, { error: 'amountPositive' })
    .refine((v) => v <= 1_000_000_000, { error: 'amountTooLarge' }),
  note: z
    .string()
    .trim()
    .max(500, { error: 'noteTooLong' })
    .transform((v) => v || undefined)
    .optional(),
});

export type ExpenseDraft = z.output<typeof createExpenseSchema>;
export type ExpenseFormInput = z.input<typeof createExpenseSchema>;
