const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** From the start of the local month to `now`. */
export function currentMonth(now: Date) {
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    to: now.toISOString(),
  };
}

/** From the start of the local day `days - 1` days ago to `now` (today included). */
export function recentDays(now: Date, days: number) {
  const from = startOfDay(now);
  from.setDate(from.getDate() - (days - 1));
  return { from: from.toISOString(), to: now.toISOString() };
}

/** `YYYY-MM-DD` of the local calendar day. */
export function dayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
