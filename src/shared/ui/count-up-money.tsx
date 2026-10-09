'use client';

import { useLocale } from 'next-intl';
import { useCountUp } from '@/shared/hooks/use-count-up';
import { formatMoney } from '@/shared/lib/money';

/** An amount that counts to its new value; screen readers get the final amount only. */
export function CountUpMoney({
  value,
  currency,
  sign,
  className,
}: {
  value: string;
  currency: string;
  sign?: 'always';
  className?: string;
}) {
  const locale = useLocale();
  const frame = useCountUp(value, currency);
  return (
    <span className={className}>
      <span aria-hidden="true">{formatMoney(frame, currency, locale, { sign })}</span>
      <span className="sr-only">{formatMoney(value, currency, locale, { sign })}</span>
    </span>
  );
}
