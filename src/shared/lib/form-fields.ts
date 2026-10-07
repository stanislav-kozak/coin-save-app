import { z } from 'zod';

const AMOUNT = /^\d+([.,]\d{1,4})?$/; // positive, ≤ 4 dp (server Decimal(19, 4))

// Shared by expense, income and recurring forms. Messages are keys of each form's `validation`
// (amountRequired, amountInvalid, amountPositive, amountTooLarge, noteTooLong).
export const amountField = z
  .string()
  .transform((v) => v.replace(/\s/g, '').replace(',', '.'))
  .refine((v) => v !== '', { error: 'amountRequired', abort: true })
  .refine((v) => AMOUNT.test(v), { error: 'amountInvalid', abort: true })
  // ≤ 4 dp and ≤ 1e9 are exact enough as a JS number for the API's @IsNumber({ maxDecimalPlaces: 4 })
  .transform(Number)
  .refine((v) => v > 0, { error: 'amountPositive' })
  .refine((v) => v <= 1_000_000_000, { error: 'amountTooLarge' });

export const noteField = z
  .string()
  .trim()
  .max(500, { error: 'noteTooLong' })
  .transform((v) => v || undefined)
  .optional();
