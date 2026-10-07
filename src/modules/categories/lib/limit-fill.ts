import { percentOf } from '@/shared/lib/money';

/** Colour stops by % of the limit: green → yellow → orange → red (design tokens, both themes). */
const STOPS = [
  { at: 0, color: 'var(--color-success)' },
  { at: 50, color: 'var(--color-warning)' },
  { at: 80, color: 'var(--color-caution)' },
  { at: 100, color: 'var(--color-destructive)' },
] as const;

/**
 * The mobile category tile's background: filled from the bottom by the share of the monthly limit
 * spent, its colour sliding smoothly between the stops. No limit — no fill.
 */
export function limitFill(
  spent: string,
  limit: string | null,
): { height: number; color: string } | null {
  if (limit === null) return null;
  const pct = Math.max(0, percentOf(spent, limit));
  const height = Math.min(pct, 100);
  const upper = STOPS.findIndex((s) => height <= s.at);
  const hi = STOPS[upper]!;
  if (height === hi.at || upper === 0) return { height, color: hi.color };
  const lo = STOPS[upper - 1]!;
  const share = Math.round(((height - lo.at) / (hi.at - lo.at)) * 100);
  return { height, color: `color-mix(in oklch, ${lo.color}, ${hi.color} ${share}%)` };
}
