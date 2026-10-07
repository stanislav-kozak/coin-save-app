'use client';

import { useTranslations } from 'next-intl';
import { ENTITY_COLORS } from '@/shared/constants/entity-colors';
import { cn } from '@/shared/lib/utils';

type Props = { id: string; label: string; value: string; onChange: (hex: string) => void };

/** Palette swatches as native radios (arrow keys, form semantics) styled as circles. */
export function ColorPicker({ id, label, value, onChange }: Props) {
  const t = useTranslations('colors');
  return (
    <div role="radiogroup" aria-labelledby={`${id}-label`} className="flex flex-col gap-2">
      <span id={`${id}-label`} className="text-caption font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {ENTITY_COLORS.map((c) => (
          <label key={c.name} className="cursor-pointer">
            <input
              type="radio"
              name={id}
              value={c.hex}
              checked={value.toLowerCase() === c.hex}
              onChange={() => onChange(c.hex)}
              aria-label={t(c.name)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={cn(
                'block size-8 rounded-full ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                c.className,
              )}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
