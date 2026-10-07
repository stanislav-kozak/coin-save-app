import { dayKey } from '@/shared/lib/periods';

export type PeriodKind = 'week' | 'month' | 'quarter' | 'year';
export type Period = { kind: PeriodKind; from: string; to: string };

const KINDS: readonly PeriodKind[] = ['week', 'month', 'quarter', 'year'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Local-calendar bounds of the period containing `day` (inclusive YYYY-MM-DD; weeks start Monday). */
function bounds(kind: PeriodKind, day: Date): [Date, Date] {
  const y = day.getFullYear();
  const m = day.getMonth();
  switch (kind) {
    case 'week': {
      const start = new Date(y, m, day.getDate() - ((day.getDay() + 6) % 7));
      return [start, new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)];
    }
    case 'month':
      return [new Date(y, m, 1), new Date(y, m + 1, 0)];
    case 'quarter': {
      const q = Math.floor(m / 3) * 3;
      return [new Date(y, q, 1), new Date(y, q + 3, 0)];
    }
    case 'year':
      return [new Date(y, 0, 1), new Date(y, 11, 31)];
  }
}

const fromKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};

export function periodOf(kind: PeriodKind, day: Date): Period {
  const [start, end] = bounds(kind, day);
  return { kind, from: dayKey(start), to: dayKey(end) };
}

/** The previous (−1) or next (+1) period of the same kind. */
export function shiftPeriod(p: Period, step: -1 | 1): Period {
  const start = fromKey(p.from);
  const anchor =
    p.kind === 'week'
      ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7 * step)
      : new Date(
          start.getFullYear() + (p.kind === 'year' ? step : 0),
          start.getMonth() + (p.kind === 'month' ? step : p.kind === 'quarter' ? 3 * step : 0),
          1,
        );
  return periodOf(p.kind, anchor);
}

export function isCurrent(p: Period, now: Date): boolean {
  const today = dayKey(now);
  return p.from <= today && today <= p.to;
}

/** `?period=…&from=…` → a period; anything missing or invalid → the current month. */
export function parsePeriod(search: URLSearchParams, now: Date): Period {
  const kind = search.get('period') as PeriodKind | null;
  const from = search.get('from');
  if (!kind || !KINDS.includes(kind)) return periodOf('month', now);
  if (!from || !DATE.test(from)) return periodOf(kind, now);
  const day = fromKey(from);
  if (Number.isNaN(day.getTime()) || dayKey(day) !== from) return periodOf('month', now);
  return periodOf(kind, day);
}

/** «Червень 2026», «Oct 5 – 11, 2026», «2026»; quarters come from messages via `quarter`. */
export function periodLabel(
  p: Period,
  locale: string,
  quarter: (n: number, year: number) => string,
): string {
  const start = fromKey(p.from);
  switch (p.kind) {
    case 'month': {
      const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(start);
      return `${month.charAt(0).toLocaleUpperCase(locale)}${month.slice(1)} ${start.getFullYear()}`;
    }
    case 'quarter':
      return quarter(Math.floor(start.getMonth() / 3) + 1, start.getFullYear());
    case 'year':
      return String(start.getFullYear());
    case 'week':
      return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).formatRange(start, fromKey(p.to));
  }
}
