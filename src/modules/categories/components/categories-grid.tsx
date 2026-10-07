'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { addMoney, percentOf } from '@/shared/lib/money';
import { SectionError } from '@/shared/ui/section-error';
import { useCategories, useMonthAnalytics } from '../api/categories-queries';
import { pendingByCategory, type PendingSpend } from '../lib/pending-spends';
import {
  CategoryCard,
  CategoryCircle,
  type CategoryView,
  type DragHandleProps,
} from './category-card';
import { CategoryDialog } from './category-dialog';

type Props = {
  spaceId: string;
  /** Lets the dashboard make each category a drop target; `isCard` distinguishes card vs circle. */
  wrap?: (
    categoryId: string,
    render: (handle?: DragHandleProps) => ReactNode,
    isCard: boolean,
  ) => ReactNode;
  /** Expenses sent but not yet in analytics — shown at once (spec §6.9), replaced by server data. */
  pending?: PendingSpend[];
};

export function CategoriesGrid({ spaceId, wrap = (_id, render) => render(), pending = [] }: Props) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('categories.manage');
  // null: closed; 'new': creating; a category: editing it.
  const [editing, setEditing] = useState<CategoryView | 'new' | null>(null);
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
    const spent = added ? addMoney(stats?.spent ?? '0', added) : (stats?.spent ?? '0');
    // Computed like the server (Math.round(spent / limit × 100)) from the limit shown next to it:
    // right after a limit edit the category list is fresh while analytics' pct is not yet.
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
            {wrap(
              item.category.id,
              (handle) => (
                <CategoryCircle
                  {...item}
                  handle={handle}
                  onEdit={() => setEditing(item.category)}
                />
              ),
              false,
            )}
          </li>
        ))}
      </ul>
      <div className="hidden grid-cols-2 gap-4 md:grid">
        {items.map((item) => (
          <div key={item.category.id}>
            {wrap(
              item.category.id,
              (handle) => (
                <CategoryCard {...item} handle={handle} onEdit={() => setEditing(item.category)} />
              ),
              true,
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setEditing('new')}
        className="flex items-center gap-1 self-start text-caption font-medium text-primary"
      >
        <Plus aria-hidden className="size-4" />
        {tc('add')}
      </button>
      <CategoryDialog
        key={editing === 'new' ? 'new' : (editing?.id ?? 'closed')}
        spaceId={spaceId}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        category={editing === 'new' || editing === null ? undefined : editing}
      />
    </section>
  );
}
