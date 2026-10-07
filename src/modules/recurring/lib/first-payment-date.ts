const pad = (n: number) => String(n).padStart(2, '0');

/** `dayOfMonth` in that month, or its last day for 29–31 in shorter months (spec §7.4). */
function clamped(year: number, month: number, dayOfMonth: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(dayOfMonth, lastDay));
}

/**
 * The first payment of a new monthly rule, sent as its `startDate` (YYYY-MM-DD, local calendar).
 * The server skips the current month whenever `startDate ≤ now`, so the start must be the first
 * future occurrence: later this month, else next month. Today counts as past.
 */
export function firstPaymentDate(dayOfMonth: number, now: Date): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let date = clamped(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (date <= today) date = clamped(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
