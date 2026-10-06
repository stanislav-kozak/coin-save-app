export type LimitStatus = 'none' | 'ok' | 'warning' | 'over';

/** Spec §10.4 buckets; `pct` comes from the backend (spent / limit × 100). */
export function limitStatus(pct: number, limit: string | null): LimitStatus {
  if (limit === null) return 'none';
  if (pct >= 100) return 'over';
  return pct >= 80 ? 'warning' : 'ok';
}
