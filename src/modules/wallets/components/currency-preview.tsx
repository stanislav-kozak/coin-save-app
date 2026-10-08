'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { components } from '@/generated/api';
import { useRate } from '@/shared/hooks/use-rate';
import { getErrorCode } from '@/shared/lib/api-error';
import { formatMoney, multiplyMoney } from '@/shared/lib/money';
import { Skeleton } from '@/shared/ui/skeleton';

type Currency = components['schemas']['Currency'];

/** «Баланс: 1 000,00 ₴ → ≈ 24,10 $ · 1 ₴ = 0,0241 $»: what a currency change will do at today's rate. */
export function CurrencyPreview({
  balance,
  from,
  to,
}: {
  balance: string;
  from: Currency;
  to: Currency;
}) {
  const t = useTranslations('wallets.currency');
  const te = useTranslations('errors');
  const locale = useLocale();
  const rate = useRate(from, to);
  if (from === to) return null;
  if (rate.isError) {
    return (
      <p role="alert" className="text-caption text-destructive">
        {te(getErrorCode(rate.error))}
      </p>
    );
  }
  if (!rate.data) return <Skeleton className="h-4 w-64" />;
  const money = (v: string, c: Currency) => formatMoney(v, c, locale);
  // Display only: "1 ₴ = 0,0241 $" (4 significant digits), never used for arithmetic.
  const rateText = (amount: string, c: Currency, digits?: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: c,
      currencyDisplay: 'narrowSymbol',
      ...(digits ? { maximumSignificantDigits: digits } : { maximumFractionDigits: 0 }),
    }).format(amount as Intl.StringNumericLiteral);
  return (
    <div className="flex flex-col gap-1 text-caption">
      <p className="text-foreground">
        {t('preview', {
          from: money(balance, from),
          to: money(multiplyMoney(balance, rate.data.rate), to),
        })}
      </p>
      <p className="text-muted-foreground">
        {t('rate', { one: rateText('1', from), rate: rateText(rate.data.rate, to, 4) })}
      </p>
    </div>
  );
}
