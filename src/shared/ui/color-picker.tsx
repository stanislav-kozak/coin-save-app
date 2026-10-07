'use client';

import { Palette } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { ENTITY_COLORS } from '@/shared/constants/entity-colors';
import { cn } from '@/shared/lib/utils';

type Props = { id: string; label: string; value: string; onChange: (hex: string) => void };

const HEX = /^#[0-9a-f]{6}$/i;
const SWATCH =
  'block size-8 rounded-full ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring';

/**
 * Palette swatches as native radios (arrow keys, form semantics) styled as circles, plus "Свій колір":
 * any color via the system picker. A value outside the palette (e.g. a seeded one) shows there, checked.
 * Emits lowercase #rrggbb — the backend compares case-sensitively.
 */
export function ColorPicker({ id, label, value, onChange }: Props) {
  const t = useTranslations('colors');
  const picker = useRef<HTMLInputElement>(null);
  const current = value.toLowerCase();
  // No color yet (e.g. a wallet created without one): nothing is checked.
  const custom = current !== '' && !ENTITY_COLORS.some((c) => c.hex === current);
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
              checked={current === c.hex}
              onChange={() => onChange(c.hex)}
              aria-label={t(c.name)}
              className="peer sr-only"
            />
            <span aria-hidden className={cn(SWATCH, c.className)} />
          </label>
        ))}
        <label className="relative cursor-pointer">
          <input
            type="radio"
            name={id}
            value="custom"
            checked={custom}
            // Arrowing onto it only moves focus; Space/Enter (or a click on the swatch) opens the
            // system picker — also when it is already checked and the radio wouldn't change.
            onChange={() => undefined}
            onKeyDown={(e) => {
              if (e.key !== ' ' && e.key !== 'Enter') return;
              e.preventDefault();
              picker.current?.click();
            }}
            aria-label={t('custom')}
            className="peer sr-only"
          />
          <span
            aria-hidden
            // The entity's own color is data (validated hex), like EntityIcon.
            style={custom && HEX.test(current) ? { backgroundColor: current } : undefined}
            className={cn(
              SWATCH,
              'flex items-center justify-center border border-border text-muted-foreground',
              !custom && 'bg-card',
            )}
          >
            {custom ? null : <Palette className="size-4" />}
          </span>
          <input
            ref={picker}
            type="color"
            tabIndex={-1}
            aria-hidden
            value={HEX.test(current) ? current : '#000000'}
            onChange={(e) => onChange(e.target.value.toLowerCase())}
            className="absolute inset-0 size-8 cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  );
}
