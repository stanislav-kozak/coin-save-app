'use client';

import { useTranslations } from 'next-intl';
import type { components } from '@/generated/api';
import { isNegative, subtractMoney } from '@/shared/lib/money';
import { cn } from '@/shared/lib/utils';
import { CountUpMoney } from '@/shared/ui/count-up-money';
import { deltaPercent } from '../lib/delta';
import type { PeriodKind } from '../lib/period';

type Totals = Pick<components['schemas']['AnalyticsResponseDto'], 'totalExpense' | 'totalIncome'>;
type Analytics = Totals & Pick<components['schemas']['AnalyticsResponseDto'], 'currency'>;

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

type Props = {
  analytics: Analytics;
  /** The previous calendar period's totals (same wallets); «—» while they load. */
  previous: Totals | undefined;
  kind: PeriodKind;
};

/** Figma 16:505: expenses, incomes (vs the previous period) and the period balance. */
export function SummaryCards({ analytics, previous, kind }: Props) {
  const t = useTranslations('analytics.summary');
  const balance = subtractMoney(analytics.totalIncome, analytics.totalExpense);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className={CARD}>
        <span className="text-caption text-muted-foreground">{t('expenses')}</span>
        <span className="text-h1 tabular-nums">
          <CountUpMoney value={analytics.totalExpense} currency={analytics.currency} />
        </span>
        <span className="flex items-center gap-2 text-caption text-muted-foreground">
          {t(`vs.${kind}`)}
          <Delta
            value={previous ? deltaPercent(analytics.totalExpense, previous.totalExpense) : null}
            goodWhenUp={false}
          />
        </span>
      </div>
      <div className={CARD}>
        <span className="text-caption text-muted-foreground">{t('incomes')}</span>
        <span className="text-h1 tabular-nums">
          <CountUpMoney value={analytics.totalIncome} currency={analytics.currency} />
        </span>
        <span className="flex items-center gap-2 text-caption text-muted-foreground">
          {t(`vs.${kind}`)}
          <Delta
            value={previous ? deltaPercent(analytics.totalIncome, previous.totalIncome) : null}
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
          <CountUpMoney value={balance} currency={analytics.currency} sign="always" />
        </span>
        <span className="text-caption text-muted-foreground">{t('thisPeriod')}</span>
      </div>
    </div>
  );
}
