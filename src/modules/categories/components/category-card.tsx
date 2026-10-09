'use client';

import { GripVertical, Pencil } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatMoney } from '@/shared/lib/money';
import { useCountUp } from '@/shared/hooks/use-count-up';
import { useBecameTrue } from '@/shared/hooks/use-became-true';
import { usePulseOnIncrease } from '@/shared/hooks/use-pulse-on-increase';
import { entityStyle } from '@/shared/lib/entity-color';
import { cn } from '@/shared/lib/utils';
import { CountUpMoney } from '@/shared/ui/count-up-money';
import { EntityIcon } from '@/shared/ui/entity-icon';
import { limitFill } from '../lib/limit-fill';
import { limitStatus, overLimit, type LimitStatus } from '../lib/limit-status';

export type CategoryView = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  monthlyLimit: string | null;
  /** The limit's own currency; null/absent = the space's. */
  currency?: string | null;
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
  // The amount counts to its new value; status and percentage use the real one.
  const shownSpent = useCountUp(spent);
  return {
    status: limitStatus(spent, limit, pct),
    caption: limit
      ? t('spentOfLimit', { spent: money(shownSpent), limit: money(limit), pct })
      : t('spent', { amount: money(shownSpent) }),
    over: excess ? t('over', { amount: money(excess) }) : null,
    overLabel: t('overLabel'),
  };
}

/** Desktop category card (Figma 8:152). */
export function CategoryCard(props: Props) {
  const { category, pct, onEdit, handle } = props;
  const t = useTranslations('categories');
  const { status, caption, over, overLabel } = useCategoryCaption(props);
  const pulse = usePulseOnIncrease(props.spent);
  const justOver = useBecameTrue(status === 'over');

  return (
    <article
      style={entityStyle(category.color)}
      className="relative flex flex-col gap-3 rounded-card border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-card-raised motion-safe:transition-[translate,box-shadow] motion-safe:hover:-translate-y-0.5"
    >
      {pulse > 0 ? (
        // Keyed by the count, so every new expense restarts the glow.
        <span
          key={pulse}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-card motion-safe:animate-entity-pulse"
        />
      ) : null}
      {status === 'over' && over ? (
        // On the card's top edge, so the header keeps its whole width for the name.
        <span
          className={cn(
            'absolute -top-3 right-4 rounded-full border border-destructive bg-card px-2 text-caption font-medium whitespace-nowrap text-destructive shadow-card',
            justOver && 'motion-safe:animate-badge-pop',
          )}
        >
          {over} <span>{overLabel}</span>
        </span>
      ) : null}
      <header className="flex items-center gap-3">
        <EntityIcon id={category.id} color={category.color} icon={category.icon} size="m" />
        <h3 className="line-clamp-2 flex-1 text-body font-medium break-words">{category.name}</h3>
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
          className={cn(
            'h-full rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-500 motion-safe:ease-out',
            BAR[status],
          )}
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

/**
 * Mobile category (user request over Figma 10:177's icon-only circle): icon, name and spent amount,
 * the tile filled from the bottom by the share of the monthly limit (green → yellow → orange → red).
 * The tile is the edit button and, from the dashboard, the reorder handle (long-press drags, tap edits).
 */
export function CategoryTile(props: Props) {
  const { category, spent, currency, onEdit, handle } = props;
  const t = useTranslations('categories');
  const { status, caption } = useCategoryCaption(props);
  const fill = limitFill(spent, category.monthlyLimit);
  const pulse = usePulseOnIncrease(spent);
  const content = (
    <>
      {pulse > 0 ? (
        <span
          key={pulse}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-card motion-safe:animate-entity-pulse"
        />
      ) : null}
      {fill ? (
        // Height and colour are data (share of the limit), like the desktop progress width.
        <span
          aria-hidden
          data-fill
          style={{ height: `${fill.height}%`, backgroundColor: fill.color }}
          className="absolute inset-x-0 bottom-0 opacity-25 transition-[height]"
        />
      ) : null}
      <EntityIcon id={category.id} color={category.color} icon={category.icon} size="m" />
      <span className="relative w-full truncate text-caption font-medium text-foreground">
        {category.name}
      </span>
      <span
        className={cn(
          'relative w-full truncate text-caption tabular-nums',
          status === 'over' ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        <CountUpMoney value={spent} currency={currency} />
      </span>
    </>
  );
  const tile =
    'relative flex w-full flex-col items-center gap-1 overflow-hidden rounded-card border border-border bg-card px-1 py-2 text-center';
  if (!onEdit)
    return (
      <div style={entityStyle(category.color)} className={tile}>
        {content}
      </div>
    );
  return (
    <button
      type="button"
      style={entityStyle(category.color)}
      {...handle}
      onClick={onEdit}
      aria-label={t('manage.edit', { name: category.name })}
      title={caption}
      className={cn(tile, 'outline-none focus-visible:ring-2 focus-visible:ring-ring/50')}
    >
      {content}
    </button>
  );
}

/** A limit progress row (analytics «Ліміти категорій», Figma 16:505): icon, name, bar and caption. */
export function CategoryLimitRow(props: Omit<Props, 'onEdit' | 'handle'>) {
  const { category, pct } = props;
  const { status, caption, over, overLabel } = useCategoryCaption(props);
  const justOver = useBecameTrue(status === 'over');
  return (
    <li className="flex items-center gap-3 py-2">
      <EntityIcon id={category.id} color={category.color} icon={category.icon} size="m" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-body font-medium">{category.name}</span>
          {status === 'over' && over ? (
            <span
              className={cn(
                'shrink-0 rounded-full border border-destructive px-2 text-caption font-medium text-destructive',
                justOver && 'motion-safe:animate-badge-pop',
              )}
            >
              {over} <span>{overLabel}</span>
            </span>
          ) : null}
        </div>
        <div
          role="progressbar"
          aria-label={category.name}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(pct, 100)}
          className="mt-1 h-2 overflow-hidden rounded-full bg-border"
        >
          <div
            className={cn(
              'h-full rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-500 motion-safe:ease-out',
              BAR[status],
            )}
            style={{ width: `${status === 'none' ? 0 : Math.min(pct, 100)}%` }}
          />
        </div>
        <p
          className={cn(
            'mt-1 text-caption',
            status === 'over' ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {caption}
        </p>
      </div>
    </li>
  );
}
