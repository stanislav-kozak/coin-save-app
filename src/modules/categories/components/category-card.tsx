'use client';

import { GripVertical, Pencil } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatMoney } from '@/shared/lib/money';
import { cn } from '@/shared/lib/utils';
import { EntityIcon } from '@/shared/ui/entity-icon';
import { limitStatus, overLimit, type LimitStatus } from '../lib/limit-status';

export type CategoryView = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  monthlyLimit: string | null;
};
type Props = {
  category: CategoryView;
  spent: string;
  pct: number;
  currency: string;
  /** Opens the category editor (pencil on the card, a tap on the circle). */
  onEdit?: () => void;
  /** Reorder activator from the dashboard's drag-and-drop: the card's grip / the circle itself. */
  handle?: DragHandleProps;
};

export type DragHandleProps = ComponentPropsWithRef<'button'>;

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
  const excess = overLimit(spent, limit);
  return {
    status: limitStatus(spent, limit, pct),
    caption: limit
      ? t('spentOfLimit', { spent: money(spent), limit: money(limit), pct })
      : t('spent', { amount: money(spent) }),
    over: excess ? t('over', { amount: money(excess) }) : null,
    overLabel: t('overLabel'),
  };
}

/** Desktop category card (Figma 8:152). */
export function CategoryCard(props: Props) {
  const { category, pct, onEdit, handle } = props;
  const t = useTranslations('categories');
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
        {handle ? (
          <button
            type="button"
            {...handle}
            aria-label={t('manage.move', { name: category.name })}
            className="flex size-8 cursor-grab touch-none items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-primary/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <GripVertical aria-hidden className="size-4" />
          </button>
        ) : null}
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            aria-label={t('manage.edit', { name: category.name })}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-primary/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Pencil aria-hidden className="size-4" />
          </button>
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
  const { category, onEdit, handle } = props;
  const t = useTranslations('categories');
  const { status, caption } = useCategoryCaption(props);
  const circle = (
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
  if (!onEdit) return circle;
  return (
    <button
      type="button"
      // Long-press reorders (TouchSensor delay), a tap edits.
      {...handle}
      onClick={onEdit}
      aria-label={t('manage.edit', { name: category.name })}
      title={caption}
      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {circle}
    </button>
  );
}
