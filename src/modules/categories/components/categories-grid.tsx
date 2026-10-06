'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { addMoney, percentOf } from '@/shared/lib/money';
import { SectionError } from '@/shared/ui/section-error';
import { useCategories, useMonthAnalytics } from '../api/categories-queries';
import { pendingByCategory, type PendingSpend } from '../lib/pending-spends';
import { CategoryCard, CategoryCircle } from './category-card';

type Props = {
  spaceId: string;
  /** Lets the dashboard make each category a drop target; `isCard` distinguishes card vs circle. */
  wrap?: (categoryId: string, node: ReactNode, isCard: boolean) => ReactNode;
  /** Expenses sent but not yet in analytics — shown at once (spec §6.9), replaced by server data. */
  pending?: PendingSpend[];
};

export function CategoriesGrid({ spaceId, wrap = (_id, node) => node, pending = [] }: Props) {
  const t = useTranslations('dashboard');
  const categories = useCategories(spaceId);
  const analytics = useMonthAnalytics(spaceId);
  const failed = categories.error ?? analytics.error;
  if (failed && !categories.isFetching && !analytics.isFetching) {
    return (
      <section aria-labelledby="categories-title" className="flex flex-col gap-4">
        <h2 id="categories-title" className="text-h2">
          {t('categories')}
        </h2>
        <SectionError
          error={failed}
          onRetry={() => {
            if (categories.isError) void categories.refetch();
            if (analytics.isError) void analytics.refetch();
          }}
        />
      </section>
    );
  }
  if (!categories.data || !analytics.data) return null;

  const { currency } = analytics.data;
  const byId = new Map(analytics.data.byCategory.map((c) => [c.categoryId, c]));
  const extra = pendingByCategory(pending, analytics.data);
  const items = categories.data.map((category) => {
    // Categories without spending this month are absent from analytics — show them at zero.
    const stats = byId.get(category.id);
    const added = extra.get(category.id);
    if (!added) return { category, spent: stats?.spent ?? '0', pct: stats?.pct ?? 0, currency };
    const spent = addMoney(stats?.spent ?? '0', added);
    const pct = category.monthlyLimit ? percentOf(spent, category.monthlyLimit) : 0;
    return { category, spent, pct, currency };
  });

  return (
    <section aria-labelledby="categories-title" className="flex flex-col gap-4">
      <h2 id="categories-title" className="text-h2">
        {t('categories')}
      </h2>
      <ul className="grid grid-cols-4 gap-4 md:hidden">
        {items.map((item) => (
          <li key={item.category.id} className="flex justify-center">
            {wrap(item.category.id, <CategoryCircle {...item} />, false)}
          </li>
        ))}
      </ul>
      <div className="hidden grid-cols-2 gap-4 md:grid">
        {items.map((item) => (
          <div key={item.category.id}>
            {wrap(item.category.id, <CategoryCard {...item} />, true)}
          </div>
        ))}
      </div>
    </section>
  );
}
