'use client';

import { useTranslations } from 'next-intl';
import type { components } from '@/generated/api';
import { CategoryLimitRow } from '@/modules/categories';
import { isNegative, percentOf, subtractMoney } from '@/shared/lib/money';

type Analytics = Pick<components['schemas']['AnalyticsResponseDto'], 'byCategory'>;

/** «Ліміти категорій» (spec §10.4): shown by the page for month periods only. */
export function LimitBars({ analytics }: { analytics: Analytics }) {
  const t = useTranslations('analytics.limits');
  // Categories with spending or a limit (an archived one with neither is just noise).
  const items = analytics.byCategory.filter(
    (c) => c.categoryId && (c.limit != null || isNegative(subtractMoney('0', c.spent))),
  );
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="limits-title" className="flex flex-col gap-2">
      <h2 id="limits-title" className="text-h2">
        {t('title')}
      </h2>
      <ul>
        {items.map((c) => (
          <CategoryLimitRow
            key={c.categoryId}
            category={{
              id: c.categoryId!,
              name: c.name,
              icon: c.icon,
              color: c.color,
              monthlyLimit: c.limit,
            }}
            // Limits and their spending are in the category's own currency (the space's by default).
            spent={c.spentInCurrency}
            pct={c.limit ? percentOf(c.spentInCurrency, c.limit) : 0}
            currency={c.currency}
          />
        ))}
      </ul>
    </section>
  );
}
