'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { enUS, uk } from 'react-day-picker/locale';
import { cn } from '@/shared/lib/utils';

/** A month calendar in the app's style (tokens, both themes), weeks from Monday, in the UI language. */
export function Calendar({ className, ...props }: DayPickerProps) {
  const locale = useLocale();
  const t = useTranslations('calendar');
  return (
    <DayPicker
      locale={locale === 'uk' ? uk : enUS}
      weekStartsOn={1}
      labels={{ labelNext: () => t('next'), labelPrevious: () => t('previous') }}
      className={cn('text-body', className)}
      classNames={{
        months: 'relative',
        month_caption: 'flex h-9 items-center justify-center',
        caption_label: 'text-body font-medium first-letter:uppercase',
        nav: 'absolute inset-x-0 top-0 flex h-9 items-center justify-between',
        button_previous:
          'flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-primary/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-40',
        button_next:
          'flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-primary/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-40',
        month_grid: 'mt-2 border-collapse',
        weekday: 'size-9 text-caption font-normal text-muted-foreground',
        day: 'p-0.5 text-center',
        day_button:
          'flex size-9 items-center justify-center rounded-full outline-none tabular-nums hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none',
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary-hover',
        today: '[&>button]:font-semibold [&>button]:text-primary',
        outside: 'text-muted-foreground/50',
        disabled: 'text-muted-foreground/40',
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft aria-hidden className="size-4" />
          ) : (
            <ChevronRight aria-hidden className="size-4" />
          ),
      }}
      {...props}
    />
  );
}
