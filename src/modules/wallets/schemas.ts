import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from '@/shared/constants/currencies';

const AMOUNT = /^-?\d+([.,]\d{1,4})?$/; // server precision: 4 decimal places
const LIMIT = 1_000_000_000;

// Messages are keys of `wallets.validation`.
const amountField = z
  .string()
  // Thousands separators as typed or pasted ("1 250,50", incl. NBSP), like expense amounts.
  .transform((v) => v.replace(/\s/g, ''))
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

/** Editing a wallet: everything but the currency (its history is in that currency). */
export const updateWalletSchema = createWalletSchema
  .omit({ currency: true })
  // A wallet may have no color yet; empty means "leave it so".
  .extend({ color: z.union([z.string().regex(/^#[0-9a-f]{6}$/i), z.literal('')]) });
export type UpdateWalletValues = z.output<typeof updateWalletSchema>;
