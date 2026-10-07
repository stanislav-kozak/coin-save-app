/** 1st of the next local month as YYYY-MM-DD: a monthly rule's start, so this month's (already added) payment isn't repeated. */
export function nextMonthStart(now: Date): string {
  const d = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
