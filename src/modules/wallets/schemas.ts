import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from '@/shared/constants/currencies';

const AMOUNT = /^-?\d+([.,]\d{1,4})?$/; // server precision: 4 decimal places
const LIMIT = 1_000_000_000;

// Messages are keys of `wallets.validation`.
const amountField = z
  .string()
  .trim()
  .transform((v) => (v === '' ? '0' : v.replace(',', '.')))
  .refine((v) => AMOUNT.test(v), { error: 'amountInvalid' })
  // Safe as a JS number: ≤ 4 dp and |x| ≤ 1e9 are represented exactly enough for the API's
  // @IsNumber({ maxDecimalPlaces: 4 }); the server stores it as Decimal(19, 4).
  .transform((v) => Number(v))
  .refine((v) => Math.abs(v) <= LIMIT, { error: 'amountTooLarge' });

export const createWalletSchema = z.object({
  name: z.string().trim().min(1, { error: 'nameRequired' }).max(100, { error: 'nameTooLong' }),
  currency: z.enum(SUPPORTED_CURRENCIES),
  initialBalance: amountField,
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
});

export type CreateWalletValues = z.output<typeof createWalletSchema>;
