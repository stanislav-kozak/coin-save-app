import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from '@/shared/constants/currencies';

// Messages are keys of `spaces.validation`.
export const createSpaceSchema = z.object({
  name: z.string().trim().min(1, { error: 'nameRequired' }).max(100, { error: 'nameTooLong' }),
  currency: z.enum(SUPPORTED_CURRENCIES),
});

export type CreateSpaceValues = z.output<typeof createSpaceSchema>;
