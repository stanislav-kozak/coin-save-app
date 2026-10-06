'use client';

import { useTranslations } from 'next-intl';
import { useCategories, useMonthAnalytics } from '../api/categories-queries';
import { CategoryCard, CategoryCircle } from './category-card';

export function CategoriesGrid({ spaceId }: { spaceId: string }) {
  const t = useTranslations('dashboard');
  const categories = useCategories(spaceId);
  const analytics = useMonthAnalytics(spaceId);
  if (!categories.data || !analytics.data) return null;

  const { currency } = analytics.data;
  const byId = new Map(analytics.data.byCategory.map((c) => [c.categoryId, c]));
  const items = categories.data.map((category) => {
    // Categories without spending this month are absent from analytics — show them at zero.
    const stats = byId.get(category.id);
    return { category, spent: stats?.spent ?? '0', pct: stats?.pct ?? 0, currency };
  });

  return (
    <section aria-labelledby="categories-title" className="flex flex-col gap-4">
      <h2 id="categories-title" className="text-h2">
        {t('categories')}
      </h2>
      <ul className="grid grid-cols-4 gap-4 md:hidden">
        {items.map((item) => (
          <li key={item.category.id} className="flex justify-center">
            <CategoryCircle {...item} />
          </li>
        ))}
      </ul>
      <div className="hidden grid-cols-2 gap-4 md:grid">
        {items.map((item) => (
          <CategoryCard key={item.category.id} {...item} />
        ))}
      </div>
    </section>
  );
}
