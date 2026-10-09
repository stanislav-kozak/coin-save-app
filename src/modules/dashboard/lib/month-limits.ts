import type { components } from '@/generated/api';
import { addMoney, multiplyMoney } from '@/shared/lib/money';

type Currency = components['schemas']['Currency'];
type Category = { monthlyLimit: string | null; currency: Currency | null; archived: boolean };

/**
 * The month's limits in the space currency: own-currency limits converted at today's rate (then the
 * total is approximate); one whose rate failed is left out and `excluded` says so. No limit → null.
 */
export function monthLimits(
  categories: Category[],
  spaceCurrency: Currency,
  rates: Map<Currency, string>,
  failed: Currency[],
): { total: string | null; approximate: boolean; excluded: boolean } {
  let total: string | null = null;
  let approximate = false;
  let excluded = false;
  for (const c of categories) {
    if (c.archived || c.monthlyLimit === null) continue;
    const own = c.currency ?? spaceCurrency;
    if (own === spaceCurrency) {
      total = addMoney(total ?? '0', c.monthlyLimit);
      continue;
    }
    approximate = true;
    const rate = rates.get(own);
    if (rate) total = addMoney(total ?? '0', multiplyMoney(c.monthlyLimit, rate));
    else if (failed.includes(own)) excluded = true;
  }
  return { total, approximate, excluded };
}
