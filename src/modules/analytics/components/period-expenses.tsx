'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import type { components } from '@/generated/api';
import { useCategories } from '@/modules/categories';
import { ExpenseRow, groupByDay } from '@/modules/expenses';

type Item = components['schemas']['AnalyticsExpenseItemDto'];

/** «Витрати за період» (Figma 16:505): every record of the period, by day, with its wallet. */
export function PeriodExpenses({ spaceId, items }: { spaceId: string; items: Item[] }) {
  const t = useTranslations('analytics.list');
  const te = useTranslations('expenses');
  const locale = useLocale();
  const [now] = useState(() => new Date());
  // Icons and colours, incl. archived categories (history keeps them).
  const categories = useCategories(spaceId, { includeArchived: true });
  const byId = new Map(categories.data?.map((c) => [c.id, c]));
  const groups = groupByDay(items, now);

  return (
    <section aria-labelledby="period-list-title" className="flex flex-col gap-3">
      <h2 id="period-list-title" className="text-h2">
        {t('title')}
      </h2>
      {groups.length === 0 ? (
        <p className="text-body text-muted-foreground">{t('empty')}</p>
      ) : (
        groups.map((g) => (
          <div key={g.key}>
            <h3 className="mb-1 text-caption font-medium text-muted-foreground">
              {g.label === 'date'
                ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(g.date)
                : te(g.label)}
            </h3>
            <ul>
              {g.items.map((e) => (
                <ExpenseRow
                  key={e.id}
                  expense={e}
                  category={e.categoryId ? byId.get(e.categoryId) : undefined}
                  wallet={e.walletName}
                />
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
