'use client';

import { cn } from '@/shared/lib/utils';

type Option = { value: string; label: string };

/** Figma's UA/EN and Світла/Темна pills: a single-choice radio group. */
export function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span id={`pills-${label}`} className="text-body text-foreground">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={`pills-${label}`} className="flex gap-2">
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(o.value)}
              className={cn(
                'h-8 rounded-full border px-4 text-caption font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                checked
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground',
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
