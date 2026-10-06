import { dayKey } from '@/shared/lib/periods';

export type DayGroup<T> = {
  key: string;
  label: 'today' | 'yesterday' | 'date';
  date: Date;
  items: T[];
};

/** Groups by local calendar day, newest day and newest item first. */
export function groupByDay<T extends { occurredAt: string }>(items: T[], now: Date): DayGroup<T>[] {
  const today = dayKey(now);
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const yesterday = dayKey(y);

  const groups = new Map<string, T[]>();
  const sorted = [...items].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  for (const item of sorted) {
    const key = dayKey(item.occurredAt);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups].map(([key, list]) => ({
    key,
    label: key === today ? 'today' : key === yesterday ? 'yesterday' : 'date',
    date: new Date(list[0].occurredAt),
    items: list,
  }));
}
