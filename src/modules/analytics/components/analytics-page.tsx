'use client';

import { useTranslations } from 'next-intl';
import { EmptyScene } from '@/shared/ui/empty-scene';
import { SectionError } from '@/shared/ui/section-error';
import { LoadingRegion, Skeleton } from '@/shared/ui/skeleton';
import { useAnalytics } from '../api/analytics-queries';
import { useAnalyticsPeriod } from '../hooks/use-analytics-period';
import { shiftPeriod } from '../lib/period';
import { CategorySplit } from './category-split';
import { ExportCsvButton } from './export-csv-button';
import { LimitBars } from './limit-bars';
import { PeriodExpenses } from './period-expenses';
import { PeriodPicker } from './period-picker';
import { SummaryCards } from './summary-cards';
import { WalletFilter } from './wallet-filter';

/** `/analytics` (spec §10.1, Figma 16:505 / 16:620). */
export function AnalyticsPage({ spaceId }: { spaceId: string }) {
  const t = useTranslations('analytics');
  const tc = useTranslations('common');
  const { period, walletIds } = useAnalyticsPeriod();
  const analytics = useAnalytics(spaceId, period, walletIds);
  // The server's previousPeriod* covers the same number of days before `from`, not the previous
  // calendar month/quarter the label promises, so the previous period is fetched like this one.
  const previous = useAnalytics(spaceId, shiftPeriod(period, -1), walletIds);

  let body;
  if (analytics.isError && !analytics.isFetching) {
    body = <SectionError error={analytics.error} onRetry={() => void analytics.refetch()} />;
  } else if (!analytics.data) {
    body = (
      <LoadingRegion label={tc('loading')} className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} shape="card" className="h-28" />
          ))}
        </div>
        <Skeleton className="h-4" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </LoadingRegion>
    );
  } else if (analytics.data.expenses.length === 0) {
    body = <EmptyScene scene="chart" title={t('emptyTitle')} text={t('emptyText')} />;
  } else {
    const data = analytics.data;
    body = (
      <>
        <SummaryCards analytics={data} previous={previous.data} kind={period.kind} />
        <CategorySplit analytics={data} />
        {/* Spec §10.4: limits are monthly. */}
        {period.kind === 'month' ? <LimitBars analytics={data} /> : null}
        <PeriodExpenses spaceId={spaceId} items={data.expenses} />
      </>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-240 flex-col gap-6 px-4 py-6 md:py-10">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-h1">{t('title')}</h1>
        <ExportCsvButton spaceId={spaceId} period={period} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodPicker />
        <WalletFilter spaceId={spaceId} />
      </div>
      {body}
    </main>
  );
}
