'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import type { components } from '@/generated/api';
import {
  CategoryDialog,
  limitStatus,
  type LimitStatus,
  useCategories,
  useMonthAnalytics,
} from '@/modules/categories';
import { useRates } from '@/shared/hooks/use-rate';
import { formatMoney, isNegative, percentOf, subtractMoney } from '@/shared/lib/money';
import { cn } from '@/shared/lib/utils';
import { CountUpMoney } from '@/shared/ui/count-up-money';
import { Skeleton } from '@/shared/ui/skeleton';
import { monthLimits } from '../lib/month-limits';

type Currency = components['schemas']['Currency'];

const BAR: Record<LimitStatus, string> = {
  none: 'bg-muted-foreground/40',
  ok: 'bg-success',
  warning: 'bg-warning',
  over: 'bg-destructive',
};

/** Spec §6 (stage 2, variant B): the month at a glance above the dashboard columns. */
export function MonthCard({ spaceId }: { spaceId: string }) {
  const t = useTranslations('dashboard.month');
  const locale = useLocale();
  const analytics = useMonthAnalytics(spaceId);
  const categories = useCategories(spaceId);
  const [setting, setSetting] = useState(false);

  const space = analytics.data?.currency as Currency | undefined;
  const own = [
    ...new Set(
      (categories.data ?? [])
        .filter((c) => !c.archived && c.monthlyLimit !== null && c.currency && c.currency !== space)
        .map((c) => c.currency as Currency),
    ),
  ];
  const rates = useRates(own, space ?? 'UAH');

  if (!analytics.data || !categories.data || !space) {
    return <Skeleton shape="card" className="h-36 md:col-span-3" />;
  }

  const { totalExpense, totalIncome } = analytics.data;
  const limits = rates.pending
    ? null
    : monthLimits(categories.data, space, rates.rates, rates.failed);
  const balance = subtractMoney(totalIncome, totalExpense);
  const now = new Date();
  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(now);
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;
  const money = (v: string) => formatMoney(v, space, locale);
  const pct = limits?.total ? percentOf(totalExpense, limits.total) : 0;
  const status = limits?.total ? limitStatus(totalExpense, limits.total, pct) : 'none';
  const first = categories.data.find((c) => !c.archived);

  return (
    <section
      aria-label={t('spentIn', { month })}
      className="flex flex-col gap-3 rounded-card border border-border bg-card p-4 shadow-card md:col-span-3 md:p-6"
    >
      <p className="text-caption text-muted-foreground">
        {t('spentIn', { month: month.charAt(0).toLocaleUpperCase(locale) + month.slice(1) })}
      </p>
      <CountUpMoney value={totalExpense} currency={space} className="text-display tabular-nums" />
      {limits === null ? (
        <Skeleton className="h-4 w-48" />
      ) : limits.total ? (
        <div className="flex flex-col gap-2">
          <p className="text-body text-muted-foreground">
            {t(limits.approximate ? 'ofLimitsApprox' : 'ofLimits', { limits: money(limits.total) })}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(pct, 100)}
            className="h-2 overflow-hidden rounded-full bg-border"
          >
            <div
              className={cn(
                'h-full rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-500 motion-safe:ease-out',
                BAR[status],
              )}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          {limits.excluded ? (
            <p className="text-caption text-muted-foreground">{t('excluded')}</p>
          ) : null}
        </div>
      ) : (
        <p className="text-body text-muted-foreground">
          <span>{t('noLimits')}</span> ·{' '}
          <button
            type="button"
            onClick={() => setSetting(true)}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            {t('setLimit')}
          </button>
        </p>
      )}
      <div className="flex flex-wrap gap-x-8 gap-y-2 pt-1">
        <div>
          <p className="text-caption text-muted-foreground">{t('income')}</p>
          <CountUpMoney value={totalIncome} currency={space} className="text-h2 text-success" />
        </div>
        <div>
          <p className="text-caption text-muted-foreground">{t('balance')}</p>
          <CountUpMoney
            value={balance}
            currency={space}
            sign="always"
            className={cn('text-h2', isNegative(balance) ? 'text-destructive' : 'text-success')}
          />
        </div>
        <div className="hidden md:block">
          <p className="text-caption text-muted-foreground">{t('daysLeft')}</p>
          <p className="text-h2">{daysLeft}</p>
        </div>
      </div>
      {setting ? (
        <CategoryDialog
          key={first?.id ?? 'new'}
          spaceId={spaceId}
          open
          onOpenChange={(open) => !open && setSetting(false)}
          category={first}
        />
      ) : null}
    </section>
  );
}
