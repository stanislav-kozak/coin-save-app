'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { useAnalyticsPeriod } from '../hooks/use-analytics-period';
import { periodLabel, periodOf, shiftPeriod, type PeriodKind } from '../lib/period';

const KINDS: PeriodKind[] = ['week', 'month', 'quarter', 'year'];
const ROMAN = ['I', 'II', 'III', 'IV'];
const ARROW =
  'flex size-8 items-center justify-center rounded-full border border-border bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-40';

/** Figma 16:505: «Тиждень · Місяць · Квартал · Рік» pills, then ◄ label ► (no future periods). */
export function PeriodPicker() {
  const t = useTranslations('analytics.period');
  const locale = useLocale();
  const { period, current, setPeriod } = useAnalyticsPeriod();
  const label = periodLabel(period, locale, (n, year) =>
    t('quarterLabel', { n: locale === 'uk' ? ROMAN[n - 1]! : String(n), year }),
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="radiogroup" aria-label={t('label')} className="flex flex-wrap gap-2">
        {KINDS.map((kind) => {
          const checked = kind === period.kind;
          return (
            <button
              key={kind}
              type="button"
              role="radio"
              aria-checked={checked}
              // A new kind starts at the period containing the current one's start (or today).
              onClick={() =>
                setPeriod(
                  periodOf(kind, current ? new Date() : new Date(`${period.from}T00:00:00`)),
                )
              }
              className={cn(
                'h-8 rounded-full border px-4 text-caption font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                checked
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground',
              )}
            >
              {t(kind)}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={t('previous')}
          onClick={() => setPeriod(shiftPeriod(period, -1))}
          className={ARROW}
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <span className="min-w-36 text-center text-body font-medium" aria-live="polite">
          {label}
        </span>
        <button
          type="button"
          aria-label={t('next')}
          disabled={current}
          onClick={() => setPeriod(shiftPeriod(period, 1))}
          className={ARROW}
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
