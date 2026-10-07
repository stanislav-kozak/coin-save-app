'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { components } from '@/generated/api';
import { formatMoney, isNegative, subtractMoney } from '@/shared/lib/money';
import { cn } from '@/shared/lib/utils';
import { deltaPercent } from '../lib/delta';
import type { PeriodKind } from '../lib/period';

type Analytics = Pick<
  components['schemas']['AnalyticsResponseDto'],
  'currency' | 'totalExpense' | 'totalIncome' | 'previousPeriodExpense' | 'previousPeriodIncome'
>;

const CARD = 'flex flex-col gap-1 rounded-card border border-border bg-card p-4 shadow-card';

function Delta({ value, goodWhenUp }: { value: number | null; goodWhenUp: boolean }) {
  const tone =
    value === null || value === 0
      ? 'bg-border text-muted-foreground'
      : value > 0 === goodWhenUp
        ? 'bg-success/12 text-success'
        : 'bg-destructive/12 text-destructive';
  const text = value === null ? '—' : `${value > 0 ? '+' : ''}${value}%`;
  return <span className={cn('rounded-full px-2 text-caption font-medium', tone)}>{text}</span>;
}

/** Figma 16:505: expenses, incomes (vs the previous period) and the period balance. */
export function SummaryCards({ analytics, kind }: { analytics: Analytics; kind: PeriodKind }) {
  const t = useTranslations('analytics.summary');
  const locale = useLocale();
  const money = (v: string, sign?: 'always') =>
    formatMoney(v, analytics.currency, locale, { sign });
  const balance = subtractMoney(analytics.totalIncome, analytics.totalExpense);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className={CARD}>
        <span className="text-caption text-muted-foreground">{t('expenses')}</span>
        <span className="text-h1 tabular-nums">{money(analytics.totalExpense)}</span>
        <span className="flex items-center gap-2 text-caption text-muted-foreground">
          {t(`vs.${kind}`)}
          <Delta
            value={deltaPercent(analytics.totalExpense, analytics.previousPeriodExpense)}
            goodWhenUp={false}
          />
        </span>
      </div>
      <div className={CARD}>
        <span className="text-caption text-muted-foreground">{t('incomes')}</span>
        <span className="text-h1 tabular-nums">{money(analytics.totalIncome)}</span>
        <span className="flex items-center gap-2 text-caption text-muted-foreground">
          {t(`vs.${kind}`)}
          <Delta
            value={deltaPercent(analytics.totalIncome, analytics.previousPeriodIncome)}
            goodWhenUp
          />
        </span>
      </div>
      <div className={CARD}>
        <span className="text-caption text-muted-foreground">{t('balance')}</span>
        <span
          className={cn(
            'text-h1 tabular-nums',
            isNegative(balance) ? 'text-destructive' : 'text-success',
          )}
        >
          {money(balance, 'always')}
        </span>
        <span className="text-caption text-muted-foreground">{t('thisPeriod')}</span>
      </div>
    </div>
  );
}
