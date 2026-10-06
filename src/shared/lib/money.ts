const SCALE = 4; // server precision: Decimal(19, 4)
// BigInt() calls instead of `10n` literals: tsconfig targets ES2017.
const ZERO = BigInt(0);
const FACTOR = BigInt(10) ** BigInt(SCALE);

function toMinor(amount: string): bigint {
  const trimmed = amount.trim();
  const negative = trimmed.startsWith('-');
  const [int, frac = ''] = trimmed.replace(/^[-+]/, '').split('.');
  const minor = BigInt(int || '0') * FACTOR + BigInt((frac + '0'.repeat(SCALE)).slice(0, SCALE));
  return negative ? -minor : minor;
}

function fromMinor(minor: bigint): string {
  const negative = minor < ZERO;
  const abs = negative ? -minor : minor;
  let frac = (abs % FACTOR).toString().padStart(SCALE, '0').replace(/0+$/, '');
  if (frac.length < 2) frac = frac.padEnd(2, '0');
  return `${negative ? '-' : ''}${abs / FACTOR}.${frac}`;
}

/** Exact a − b on decimal strings (never through floats). */
export function subtractMoney(a: string, b: string): string {
  return fromMinor(toMinor(a) - toMinor(b));
}

export function isNegative(amount: string): boolean {
  return toMinor(amount) < ZERO;
}

/** Intl formatting straight from the decimal string (Intl reads numeric strings exactly). */
export function formatMoney(
  amount: string,
  currency: string,
  locale: string,
  opts: { sign?: 'auto' | 'always' } = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    signDisplay: opts.sign === 'always' ? 'exceptZero' : 'auto',
  }).format(amount as Intl.StringNumericLiteral);
}
