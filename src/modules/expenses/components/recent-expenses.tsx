'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCategories } from '@/modules/categories';
import { EmptyState } from '@/shared/ui/empty-state';
import { useRecentExpenses } from '../api/expenses-queries';
import { groupByDay } from '../lib/group-by-day';
import { ExpenseRow } from './expense-row';

export function RecentExpenses({ spaceId }: { spaceId: string }) {
  const t = useTranslations('expenses');
  const td = useTranslations('dashboard');
  const locale = useLocale();
  const expenses = useRecentExpenses(spaceId);
  const categories = useCategories(spaceId);
  if (!expenses.data) return null;

  const byId = new Map(categories.data?.map((c) => [c.id, c]));
  const groups = groupByDay(expenses.data, new Date());
  return (
    <section aria-labelledby="recent-title" className="flex flex-col gap-4">
      <h2 id="recent-title" className="text-h2">
        {td('recent')}
      </h2>
      {groups.length === 0 ? <EmptyState title={t('emptyTitle')} text={t('emptyText')} /> : null}
      {groups.map((g) => (
        <div key={g.key}>
          <h3 className="mb-1 text-caption font-medium text-muted-foreground">
            {g.label === 'date'
              ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(g.date)
              : t(g.label)}
          </h3>
          <ul>
            {g.items.map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                category={e.categoryId ? byId.get(e.categoryId) : undefined}
              />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
