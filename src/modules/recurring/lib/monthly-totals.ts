import { addMoney } from '@/shared/lib/money';

/**
 * "Разом/міс" for a section: active rules summed exactly per currency (there is no single rate to
 * convert with), in order of first appearance.
 */
export function monthlyTotals(
  rules: { amount: string; currency: string; active: boolean }[],
): { currency: string; amount: string }[] {
  const totals = new Map<string, string>();
  for (const rule of rules) {
    if (!rule.active) continue;
    totals.set(rule.currency, addMoney(totals.get(rule.currency) ?? '0', rule.amount));
  }
  return [...totals].map(([currency, amount]) => ({ currency, amount }));
}
