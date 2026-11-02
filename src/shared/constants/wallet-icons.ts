import {
  Baby,
  Banknote,
  Bitcoin,
  Briefcase,
  Car,
  ChartLine,
  Coins,
  CreditCard,
  Gem,
  Gift,
  GraduationCap,
  HandCoins,
  Heart,
  House,
  Landmark,
  PiggyBank,
  Plane,
  Vault,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/*
 * Wallet icons, stored in the wallet's free-form `icon` (≤ 50 chars) as a prefixed key, so they
 * never clash with the emoji categories keep there: `i:<name>` draws a line icon, `c:<CODE>` the
 * currency's symbol. A `|dark` suffix draws it dark instead of white (for bright colors), e.g.
 * `i:bank|dark`. Labels are `walletIcons.<name>` / the currency code.
 */

const DARK = '|dark';

/** A stored value → its icon key ('' = none) and whether it's drawn dark. */
export function parseIconValue(value: string | null | undefined): { key: string; dark: boolean } {
  if (!value) return { key: '', dark: false };
  return value.endsWith(DARK)
    ? { key: value.slice(0, -DARK.length), dark: true }
    : { key: value, dark: false };
}

/** The value to store; a color-only circle has nothing to darken. */
export function iconValue(key: string, dark: boolean): string {
  return key && dark ? key + DARK : key;
}

/** What the money is kept in. */
export const KEEP_ICONS = {
  wallet: Wallet,
  card: CreditCard,
  bank: Landmark,
  cash: Banknote,
  coins: Coins,
  savings: PiggyBank,
  safe: Vault,
  debt: HandCoins,
  invest: ChartLine,
  crypto: Bitcoin,
  gem: Gem,
} as const satisfies Record<string, LucideIcon>;

/** What the money is for. */
export const PURPOSE_ICONS = {
  work: Briefcase,
  home: House,
  car: Car,
  travel: Plane,
  gifts: Gift,
  study: GraduationCap,
  kids: Baby,
  health: Heart,
} as const satisfies Record<string, LucideIcon>;

export type WalletIconName = keyof typeof KEEP_ICONS | keyof typeof PURPOSE_ICONS;

/** Currency symbols worth an icon (the common wallet currencies). */
export const CURRENCY_SYMBOLS = {
  UAH: '₴',
  USD: '$',
  EUR: '€',
  GBP: '£',
  PLN: 'zł',
  JPY: '¥',
  TRY: '₺',
  CZK: 'Kč',
} as const;

const LINE_ICONS: Record<string, LucideIcon> = { ...KEEP_ICONS, ...PURPOSE_ICONS };

export const iconKey = (name: WalletIconName) => `i:${name}`;
export const currencyKey = (code: keyof typeof CURRENCY_SYMBOLS) => `c:${code}`;

/**
 * A stored icon value → what to draw (a line icon, a currency symbol, or the text itself: an emoji)
 * and whether it's dark.
 */
export function resolveIcon(
  value: string,
):
  | { kind: 'line'; Icon: LucideIcon; dark: boolean }
  | { kind: 'symbol'; text: string; dark: boolean }
  | { kind: 'text'; text: string } {
  const { key, dark } = parseIconValue(value);
  if (key.startsWith('i:')) {
    const Icon = LINE_ICONS[key.slice(2)] as LucideIcon | undefined;
    if (Icon) return { kind: 'line', Icon, dark };
  }
  if (key.startsWith('c:')) {
    const text = CURRENCY_SYMBOLS[key.slice(2) as keyof typeof CURRENCY_SYMBOLS];
    if (text) return { kind: 'symbol', text, dark };
  }
  // An unknown key draws nothing rather than its raw "i:…" text.
  return key.startsWith('i:') || key.startsWith('c:')
    ? { kind: 'text', text: '' }
    : { kind: 'text', text: value };
}
