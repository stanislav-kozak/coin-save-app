import { percentOf, subtractMoney } from '@/shared/lib/money';

const ZERO = /^-?0(\.0+)?$/;

/** Rounded % change vs the previous period (exact decimals); null when there is nothing to compare with. */
export function deltaPercent(current: string, previous: string): number | null {
  if (ZERO.test(previous.trim())) return null;
  return percentOf(subtractMoney(current, previous), previous);
}
