import { isNegative, subtractMoney } from '@/shared/lib/money';

export type LimitStatus = 'none' | 'ok' | 'warning' | 'over';

/**
 * Spec §10.4 buckets. "Over" is decided on the exact decimals (spent ≥ limit): the backend's `pct` is
 * rounded, so 1995 of 2000 arrives as 100. `pct` only picks the warning bucket.
 */
export function limitStatus(spent: string, limit: string | null, pct: number): LimitStatus {
  if (limit === null) return 'none';
  if (!isNegative(subtractMoney(spent, limit))) return 'over';
  return pct >= 80 ? 'warning' : 'ok';
}

/** Amount above the limit, or null when there is none to show (at or under the limit). */
export function overLimit(spent: string, limit: string | null): string | null {
  if (limit === null) return null;
  const excess = subtractMoney(spent, limit);
  return isNegative(excess) || /^0\.0+$/.test(excess) ? null : excess;
}
