// Mirrors coin-save-api src/common/constants/currencies.ts (SUPPORTED_CURRENCIES). UAH first: default.
export const SUPPORTED_CURRENCIES = [
  'UAH',
  'USD',
  'EUR',
  'GBP',
  'PLN',
  'CZK',
  'CHF',
  'CAD',
  'AUD',
  'JPY',
  'TRY',
  'RON',
  'RUB',
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];
export const DEFAULT_CURRENCY: Currency = 'UAH';

/** "UAH — Українська гривня": the name comes from Intl, so it follows the UI language. */
export function currencyLabel(code: string, locale: string): string {
  const name = new Intl.DisplayNames([locale], { type: 'currency' }).of(code) ?? code;
  return `${code} — ${name.charAt(0).toLocaleUpperCase(locale)}${name.slice(1)}`;
}
