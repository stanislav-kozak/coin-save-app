'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import {
  CURRENCY_SYMBOLS,
  KEEP_ICONS,
  PURPOSE_ICONS,
  currencyKey,
  iconKey,
  iconValue,
  parseIconValue,
  type WalletIconName,
} from '@/shared/constants/wallet-icons';
import { EntityIcon } from '@/shared/ui/entity-icon';

type Props = {
  id: string;
  label: string;
  /** The stored value (`i:…` / `c:…`, maybe `|dark`), or '' for no icon. */
  value: string;
  /** The wallet's chosen color, so every option previews the real circle. */
  color: string;
  onChange: (value: string) => void;
};

// flex, not block: an empty inline circle (the color-only option) would sit on a text baseline and
// make the selection ring an oval.
const OPTION =
  'flex rounded-full ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring';

/**
 * Wallet icon: the plain color circle, what the money is kept in, what it's for, or its currency's
 * symbol, all in one list, each previewed in the wallet's own color. Native radios (arrow keys,
 * form semantics) like the ColorPicker. A switch draws the icon dark, for bright colors.
 */
export function WalletIconPicker({ id, label, value, color, onChange }: Props) {
  const t = useTranslations('walletIcons');
  const { key, dark } = parseIconValue(value);
  // One list: the plain color circle first, then what the money is kept in, what it's for, and
  // the currency symbols.
  const options: { value: string; label: string }[] = [
    { value: '', label: t('none') },
    ...(Object.keys({ ...KEEP_ICONS, ...PURPOSE_ICONS }) as WalletIconName[]).map((n) => ({
      value: iconKey(n),
      label: t(`names.${n}`),
    })),
    ...(Object.keys(CURRENCY_SYMBOLS) as (keyof typeof CURRENCY_SYMBOLS)[]).map((c) => ({
      value: currencyKey(c),
      label: c,
    })),
  ];
  const radio = (option: { value: string; label: string }, preview: ReactNode) => (
    <label key={option.value || 'none'} className="cursor-pointer">
      <input
        type="radio"
        name={id}
        value={option.value}
        checked={key === option.value}
        onChange={() => onChange(iconValue(option.value, dark))}
        aria-label={option.label}
        className="peer sr-only"
      />
      <span aria-hidden className={OPTION}>
        {preview}
      </span>
    </label>
  );
  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-labelledby={`${id}-label`} className="flex flex-col gap-2">
        <span id={`${id}-label`} className="text-caption font-medium text-muted-foreground">
          {label}
        </span>
        <div className="flex flex-wrap gap-2">
          {options.map((o) =>
            radio(
              o,
              <EntityIcon id={id} color={color} icon={iconValue(o.value, dark) || null} size="s" />,
            ),
          )}
        </div>
      </div>
      <label className="flex cursor-pointer items-center justify-between gap-3 has-disabled:cursor-default">
        <span className="text-body text-foreground">{t('dark')}</span>
        <input
          type="checkbox"
          role="switch"
          checked={dark}
          // A color-only circle has no icon to darken.
          disabled={!key}
          onChange={(e) => onChange(iconValue(key, e.target.checked))}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="relative h-6 w-10 shrink-0 rounded-full bg-border transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 peer-disabled:opacity-50 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-card after:shadow-card after:transition-transform peer-checked:after:translate-x-4"
        />
      </label>
    </div>
  );
}
