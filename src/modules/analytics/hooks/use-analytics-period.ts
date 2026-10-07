'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { usePathname, useRouter } from '@/shared/i18n/navigation';
import { isCurrent, parsePeriod, type Period } from '../lib/period';

/**
 * The analytics period and wallet filter live in the URL (`?period=&from=&wallets=`), so a view survives
 * reload and can be shared. Changes replace the entry: browsing periods doesn't flood history.
 */
export function useAnalyticsPeriod() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [now] = useState(() => new Date());
  const period = parsePeriod(new URLSearchParams(search.toString()), now);
  const walletIds = (search.get('wallets') ?? '').split(',').filter(Boolean);

  const go = (p: Period, wallets: string[]) => {
    const q = new URLSearchParams({ period: p.kind, from: p.from });
    if (wallets.length > 0) q.set('wallets', wallets.join(','));
    router.replace(`${pathname}?${q.toString()}`);
  };

  return {
    period,
    walletIds,
    current: isCurrent(period, now),
    setPeriod: (p: Period) => go(p, walletIds),
    setWallets: (wallets: string[]) => go(period, wallets),
  };
}
