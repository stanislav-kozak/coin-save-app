/** IANA zone of this browser (e.g. "Europe/Kyiv"); period endpoints count days in it (`tz`). */
export const userTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** `YYYY-MM-DD` of the local calendar day. */
export function dayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** This month so far as inclusive local calendar dates (the API reads them in `tz`). */
export function currentMonth(now: Date) {
  return { from: dayKey(new Date(now.getFullYear(), now.getMonth(), 1)), to: dayKey(now) };
}

/** The last `days` local calendar days including today, inclusive. */
export function recentDays(now: Date, days: number) {
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
  return { from: dayKey(from), to: dayKey(now) };
}
