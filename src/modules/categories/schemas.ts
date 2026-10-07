import { z } from 'zod';

const LIMIT = /^\d+([.,]\d{1,4})?$/; // positive, ≤ 4 dp (server Decimal(19, 4))

// Messages are keys of `categories.validation`.
export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, { error: 'nameRequired' }).max(100, { error: 'nameTooLong' }),
  // Empty only when editing a category that never had one: left as is.
  icon: z.string(),
  color: z.union([z.string().regex(/^#[0-9a-f]{6}$/i), z.literal('')]),
  // Empty means "no limit" (sent as null on edit, which removes an existing one).
  monthlyLimit: z
    .string()
    .transform((v) => v.replace(/\s/g, '').replace(',', '.'))
    .refine((v) => v === '' || LIMIT.test(v), { error: 'limitInvalid', abort: true })
    .transform((v) => (v === '' ? null : Number(v)))
    .refine((v) => v === null || v > 0, { error: 'limitPositive' })
    .refine((v) => v === null || v <= 1_000_000_000, { error: 'limitTooLarge' }),
});

export type CategoryFormValues = z.output<typeof categoryFormSchema>;
export type CategoryFormInput = z.input<typeof categoryFormSchema>;
