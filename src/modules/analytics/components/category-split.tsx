'use client';

import { useTranslations } from 'next-intl';
import type { components } from '@/generated/api';
import { isNegative, splitPercent, subtractMoney } from '@/shared/lib/money';

type Analytics = Pick<components['schemas']['AnalyticsResponseDto'], 'byCategory'>;

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * «Розподіл за категоріями» as in Figma 16:505 (a stacked bar + legend; the spec's donut was replaced
 * by the design). Shares of spending, whole percents adding up to 100; colours are the categories' own.
 */
export function CategorySplit({ analytics }: { analytics: Analytics }) {
  const t = useTranslations('analytics.split');
  const items = analytics.byCategory
    .filter((c) => isNegative(subtractMoney('0', c.spent))) // spent > 0
    .sort((a, b) => (isNegative(subtractMoney(b.spent, a.spent)) ? -1 : 1));
  const shares = splitPercent(items.map((c) => c.spent));

  return (
    <section aria-labelledby="split-title" className="flex flex-col gap-3">
      <h2 id="split-title" className="text-h2">
        {t('title')}
      </h2>
      {items.length === 0 ? (
        <p className="text-body text-muted-foreground">{t('empty')}</p>
      ) : (
        <>
          <div aria-hidden className="flex h-4 gap-0.5 overflow-hidden rounded-full">
            {items.map((c, i) => (
              <span
                key={c.categoryId ?? 'none'}
                data-segment
                // Width and colour are data (share, the category's colour).
                style={{
                  width: `${shares[i]}%`,
                  backgroundColor: c.color && HEX.test(c.color) ? c.color : undefined,
                }}
                className="h-full min-w-1 bg-muted-foreground/40 first:rounded-l-full last:rounded-r-full"
              />
            ))}
          </div>
          <ul className="grid gap-x-6 gap-y-1 text-caption sm:grid-cols-2 md:grid-cols-3">
            {items.map((c, i) => (
              <li key={c.categoryId ?? 'none'} className="flex items-center gap-2">
                <span
                  aria-hidden
                  style={{ backgroundColor: c.color && HEX.test(c.color) ? c.color : undefined }}
                  className="size-2 shrink-0 rounded-full bg-muted-foreground/40"
                />
                {`${c.categoryId ? c.name : t('uncategorized')} — ${shares[i]}%`}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
