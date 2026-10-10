'use client';

import { CalendarDays } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const pad = (n: number) => String(n).padStart(2, '0');
/** 'YYYY-MM-DD' ↔ a local Date (no time zone shifts). */
const toDate = (v: string) => {
  const [y, m, d] = v.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};
const toValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** A date field that opens the app's calendar; the value is a local calendar date (YYYY-MM-DD). */
export function DateField({
  id,
  label,
  value,
  min,
  onChange,
  className,
}: {
  id: string;
  label: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const selected = toDate(value);
  const text = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(selected);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-label={`${label}: ${text}`}
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-control border border-input bg-card px-3 text-left text-field text-foreground outline-none focus-visible:border-primary md:text-body',
            className,
          )}
        >
          <CalendarDays aria-hidden className="size-4 text-muted-foreground" />
          {text}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          required
          selected={selected}
          defaultMonth={selected}
          disabled={min ? { before: toDate(min) } : undefined}
          onSelect={(d) => {
            onChange(toValue(d));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
