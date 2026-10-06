'use client';

import { useLocale, useTranslations } from 'next-intl';
import { formatMoney, subtractMoney } from '@/shared/lib/money';
import { cn } from '@/shared/lib/utils';
import { EntityIcon } from '@/shared/ui/entity-icon';
import { limitStatus, type LimitStatus } from '../lib/limit-status';

export type CategoryView = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  monthlyLimit: string | null;
};
type Props = { category: CategoryView; spent: string; pct: number; currency: string };

const BAR: Record<LimitStatus, string> = {
  none: 'bg-muted-foreground/40',
  ok: 'bg-success',
  warning: 'bg-warning',
  over: 'bg-destructive',
};

export function useCategoryCaption({ category, spent, pct, currency }: Props) {
  const t = useTranslations('categories');
  const locale = useLocale();
  const money = (v: string) => formatMoney(v, currency, locale);
  const limit = category.monthlyLimit;
  return {
    status: limitStatus(pct, limit),
    caption: limit
      ? t('spentOfLimit', { spent: money(spent), limit: money(limit), pct })
      : t('spent', { amount: money(spent) }),
    over: limit ? t('over', { amount: money(subtractMoney(spent, limit)) }) : null,
    overLabel: t('overLabel'),
  };
}

/** Desktop category card (Figma 8:152). */
export function CategoryCard(props: Props) {
  const { category, pct } = props;
  const { status, caption, over, overLabel } = useCategoryCaption(props);

  return (
    <article className="flex flex-col gap-3 rounded-card border border-border bg-card p-4 shadow-card">
      <header className="flex items-center gap-3">
        <EntityIcon id={category.id} color={category.color} icon={category.icon} size="m" />
        <h3 className="flex-1 truncate text-body font-medium">{category.name}</h3>
        {status === 'over' && over ? (
          <span className="rounded-full bg-destructive/12 px-2 text-caption font-medium text-destructive">
            {over} <span>{overLabel}</span>
          </span>
        ) : null}
      </header>
      <div
        role="progressbar"
        aria-label={category.name}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(pct, 100)}
        className="h-2 overflow-hidden rounded-full bg-border"
      >
        {/* Width is data (percentage), the only other inline style besides entity colors. */}
        <div
          className={cn('h-full rounded-full', BAR[status])}
          style={{ width: `${status === 'none' ? 0 : Math.min(pct, 100)}%` }}
        />
      </div>
      <p
        className={cn(
          'text-caption',
          status === 'over' ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {caption}
      </p>
    </article>
  );
}

const RING: Record<LimitStatus, string> = {
  none: '',
  ok: '',
  warning: 'ring-2 ring-warning ring-offset-2 ring-offset-background',
  over: 'ring-2 ring-destructive ring-offset-2 ring-offset-background',
};

/** Mobile icon-only category (Figma 10:177); the limit state shows as a ring. */
export function CategoryCircle(props: Props) {
  const { category } = props;
  const { status, caption } = useCategoryCaption(props);
  return (
    <span className={cn('inline-flex rounded-full', RING[status])}>
      <EntityIcon
        id={category.id}
        color={category.color}
        icon={category.icon}
        size="l"
        label={`${category.name}: ${caption}`}
      />
    </span>
  );
}
