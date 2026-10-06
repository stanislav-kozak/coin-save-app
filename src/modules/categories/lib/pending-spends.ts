import type { components } from '@/generated/api';
import { addMoney, multiplyMoney } from '@/shared/lib/money';

type Analytics = Pick<components['schemas']['AnalyticsResponseDto'], 'currency'> & {
  expenses: Pick<
    components['schemas']['AnalyticsExpenseItemDto'],
    'walletCurrency' | 'fxRate' | 'occurredAt'
  >[];
};

/** An expense sent but not yet reflected in analytics; `amount` is in the wallet currency. */
export type PendingSpend = { categoryId: string; amount: string; currency: string };

/**
 * Pending amounts per category in the analytics (space) currency. Another currency is converted at
 * the latest rate seen this month (the server's rate may differ slightly and replaces it on refetch);
 * a currency with no known rate is left to the server.
 */
export function pendingByCategory(
  pending: PendingSpend[],
  analytics: Analytics,
): Map<string, string> {
  const totals = new Map<string, string>();
  for (const spend of pending) {
    const rate =
      spend.currency === analytics.currency ? '1' : latestRate(analytics, spend.currency);
    if (!rate) continue;
    const amount = multiplyMoney(spend.amount, rate);
    totals.set(spend.categoryId, addMoney(totals.get(spend.categoryId) ?? '0', amount));
  }
  return totals;
}

function latestRate(analytics: Analytics, currency: string): string | undefined {
  let latest: Analytics['expenses'][number] | undefined;
  for (const e of analytics.expenses) {
    if (e.walletCurrency === currency && (!latest || e.occurredAt > latest.occurredAt)) latest = e;
  }
  return latest?.fxRate;
}
