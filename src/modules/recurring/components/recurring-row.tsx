'use client';

import { Pause, Play, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { components } from '@/generated/api';
import { formatMoney } from '@/shared/lib/money';
import { cn } from '@/shared/lib/utils';
import { EntityIcon } from '@/shared/ui/entity-icon';

type Rule = components['schemas']['RecurringTransactionResponseDto'];
type Look = { id: string; icon?: string | null; color?: string | null };

const ICON_BUTTON =
  'flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50';

/** One rule (Figma 13:437 / 16:471): icon, name, «щомісяця, N-го», signed amount, pause and delete. */
export function RecurringRow({
  rule,
  look,
  busy,
  onEdit,
  onToggle,
  onDelete,
}: {
  rule: Rule;
  /** The category (expense) or wallet (income) whose icon and colour the row borrows. */
  look: Look;
  busy: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations('recurring');
  const locale = useLocale();
  const income = rule.type === 'INCOME';
  const amount = formatMoney(income ? rule.amount : `-${rule.amount}`, rule.currency, locale, {
    sign: 'always',
  });
  const until = rule.endDate
    ? t('until', {
        date: new Intl.DateTimeFormat(locale, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date(rule.endDate)),
      })
    : null;

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-card border border-border bg-card p-4 shadow-card',
        !rule.active && 'opacity-60',
      )}
    >
      {/* The row opens edit; the action buttons sit beside it, not inside (no nested buttons). */}
      <button
        type="button"
        onClick={onEdit}
        aria-label={t('edit', { name: rule.name })}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-control text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <EntityIcon id={look.id} color={look.color} icon={look.icon} size="m" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-body font-medium">{rule.name}</span>
            {!rule.active ? (
              <span className="shrink-0 rounded-full bg-border px-2 text-caption text-muted-foreground">
                {t('paused')}
              </span>
            ) : null}
          </span>
          <span className="block truncate text-caption text-muted-foreground">
            {t('monthly', { day: rule.dayOfMonth })}
            {until ? ` · ${until}` : null}
          </span>
          <span
            className={cn(
              'block text-body font-semibold tabular-nums md:hidden',
              income ? 'text-success' : 'text-foreground',
            )}
          >
            {amount}
          </span>
        </span>
        <span
          className={cn(
            'hidden text-body font-semibold tabular-nums md:block',
            income ? 'text-success' : 'text-foreground',
          )}
        >
          {amount}
        </span>
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onToggle}
        aria-label={t(rule.active ? 'pause' : 'resume', { name: rule.name })}
        className={ICON_BUTTON}
      >
        {rule.active ? (
          <Pause aria-hidden className="size-4" />
        ) : (
          <Play aria-hidden className="size-4" />
        )}
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={t('delete', { name: rule.name })}
        className={cn(ICON_BUTTON, 'hover:border-destructive hover:text-destructive')}
      >
        <X aria-hidden className="size-4" />
      </button>
    </li>
  );
}
