'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useCategories } from '@/modules/categories';
import { useNewIds } from '@/shared/hooks/use-new-ids';
import { EmptyState } from '@/shared/ui/empty-state';
import { SectionError } from '@/shared/ui/section-error';
import { LoadingRegion, Skeleton } from '@/shared/ui/skeleton';
import { useRecentExpenses } from '../api/expenses-queries';
import { groupByDay } from '../lib/group-by-day';
import { ExpenseEditDialog, type EditableExpense } from './expense-edit-dialog';
import { ExpenseRow } from './expense-row';

export function RecentExpenses({ spaceId }: { spaceId: string }) {
  const t = useTranslations('expenses');
  const td = useTranslations('dashboard');
  const tl = useTranslations('common');
  const locale = useLocale();
  const expenses = useRecentExpenses(spaceId);
  const [editing, setEditing] = useState<EditableExpense | null>(null);
  // An optimistic row (`optimistic-…`) is replaced by the saved one: it slides in once, not twice.
  const fresh = useNewIds(
    expenses.data?.map((e) => e.id),
    (id) => id.startsWith('optimistic-'),
  );
  // Names for history include archived categories.
  const categories = useCategories(spaceId, { includeArchived: true });
  if (expenses.isError && !expenses.isFetching) {
    return (
      <section aria-labelledby="recent-title" className="flex flex-col gap-4">
        <h2 id="recent-title" className="text-h2">
          {td('recent')}
        </h2>
        <SectionError error={expenses.error} onRetry={() => void expenses.refetch()} />
      </section>
    );
  }
  if (!expenses.data) {
    return (
      <section aria-labelledby="recent-title" className="flex flex-col gap-4">
        <h2 id="recent-title" className="text-h2">
          {td('recent')}
        </h2>
        <LoadingRegion label={tl('loading')} className="flex flex-col gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} data-skeleton="row" className="flex items-center gap-3">
              <Skeleton shape="circle" className="size-8" />
              <div className="flex flex-1 flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </LoadingRegion>
      </section>
    );
  }

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
                onOpen={() => setEditing(e)}
                isNew={fresh.has(e.id)}
              />
            ))}
          </ul>
        </div>
      ))}
      {editing ? (
        <ExpenseEditDialog
          key={editing.id}
          spaceId={spaceId}
          expense={editing}
          open
          onOpenChange={(open) => !open && setEditing(null)}
        />
      ) : null}
    </section>
  );
}
