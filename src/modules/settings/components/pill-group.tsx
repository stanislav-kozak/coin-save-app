'use client';

import { useId, useRef, type KeyboardEvent } from 'react';
import { cn } from '@/shared/lib/utils';

type Option = { value: string; label: string };

/** Figma's UA/EN and Світла/Темна pills: a single-choice radio group. */
export function PillGroup({
  label,
  options,
  value,
  onChange,
  busy,
}: {
  label: string;
  options: Option[];
  value: string | undefined;
  onChange: (value: string) => void;
  /** While a choice is being saved: locked and announced as busy. */
  busy?: boolean;
}) {
  const labelId = useId(); // labels contain spaces, so they can't double as ids
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  // Radio-group keyboard pattern: one tab stop, arrows move and select (wrapping).
  const onKeyDown = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step || busy) return;
    e.preventDefault();
    const next = (current + step + options.length) % options.length;
    onChange(options[next]!.value);
    buttons.current[next]?.focus();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span id={labelId} className="text-body text-foreground">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-busy={busy || undefined}
        className="flex gap-2"
      >
        {options.map((o, i) => {
          const checked = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              ref={(el) => {
                buttons.current[i] = el;
              }}
              aria-checked={checked}
              tabIndex={i === current ? 0 : -1}
              disabled={busy}
              onKeyDown={onKeyDown}
              onClick={() => onChange(o.value)}
              className={cn(
                'h-8 rounded-full border px-4 text-caption font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60',
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
