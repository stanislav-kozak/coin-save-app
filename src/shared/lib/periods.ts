const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * From the start of the local month to `now`. `from` is a calendar date, not a timestamp: the analytics
 * API truncates `from` to a UTC day, so local midnight east of UTC (e.g. Kyiv 1 Oct 00:00 = 30 Sep 21:00Z)
 * would pull in the previous month's last day. Until the API takes a timezone, the first hours of the
 * 1st (00:00–03:00 Kyiv) fall outside the month instead.
 */
export function currentMonth(now: Date) {
  return { from: dayKey(new Date(now.getFullYear(), now.getMonth(), 1)), to: now.toISOString() };
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
