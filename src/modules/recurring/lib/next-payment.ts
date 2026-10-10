const pad = (n: number) => String(n).padStart(2, '0');
const toValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** An API date ('2026-10-15' or '2026-10-15T00:00:00.000Z') as a local calendar date. */
const toDate = (v: string) => {
  const [y, m, d] = v.slice(0, 10).split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};
/** `dayOfMonth` in that month, or its last day for 29–31 in shorter months (spec §7.4). */
const clamped = (year: number, month: number, dayOfMonth: number) =>
  new Date(year, month, Math.min(dayOfMonth, new Date(year, month + 1, 0).getDate()));

type Rule = { startDate: string; lastGeneratedAt?: string | null };

/** The month the server looks for the next payment in: after the last generated one, else the start's. */
function cursorMonth(rule: Rule): Date {
  if (!rule.lastGeneratedAt) return toDate(rule.startDate);
  const last = toDate(rule.lastGeneratedAt);
  return new Date(last.getFullYear(), last.getMonth() + 1, 1);
}

/**
 * The next payment of an existing rule with `dayOfMonth`, as the server computes it
 * (coin-save-api `computeNextOccurrenceDate`): that day in the cursor month, else the month after
 * when it falls before the start.
 */
export function nextPayment(dayOfMonth: number, rule: Rule): string {
  const start = toDate(rule.startDate);
  const month = cursorMonth(rule);
  let date = clamped(month.getFullYear(), month.getMonth(), dayOfMonth);
  if (date < start) date = clamped(month.getFullYear(), month.getMonth() + 1, dayOfMonth);
  return toValue(date);
}

/**
 * The dates the next payment can be moved to by changing only `dayOfMonth`: one month from the
 * start (before the first payment) or from the cursor month. Each date in it is its own next payment.
 */
export function nextPaymentWindow(rule: Rule): { from: string; to: string } {
  const start = toDate(rule.startDate);
  const month = cursorMonth(rule);
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const from = start > first ? start : first;
  const to = new Date(from.getFullYear(), from.getMonth() + 1, from.getDate() - 1);
  return { from: toValue(from), to: toValue(to) };
}
