'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWallets } from '@/modules/wallets';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { useAnalyticsPeriod } from '../hooks/use-analytics-period';

/** «Усі гаманці ▾» (Figma 16:505): multi-select; archived wallets are listed too (their history counts). */
export function WalletFilter({ spaceId }: { spaceId: string }) {
  const t = useTranslations('analytics.wallets');
  const wallets = useWallets(spaceId, { includeArchived: true });
  const { walletIds, setWallets } = useAnalyticsPeriod();
  const selected = wallets.data?.filter((w) => walletIds.includes(w.id)) ?? [];
  const label =
    walletIds.length === 0
      ? t('all')
      : selected.length === 1
        ? selected[0]!.name
        : t('some', { count: walletIds.length });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 items-center gap-2 rounded-full border border-border bg-card px-4 text-caption font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        {label}
        <ChevronDown aria-hidden className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setWallets([])}>{t('all')}</DropdownMenuItem>
        <DropdownMenuSeparator />
        {wallets.data?.map((w) => (
          <DropdownMenuCheckboxItem
            key={w.id}
            checked={walletIds.includes(w.id)}
            onCheckedChange={(on) =>
              setWallets(on ? [...walletIds, w.id] : walletIds.filter((id) => id !== w.id))
            }
          >
            {w.name} · {w.currency}
            {w.archived ? ` ${t('archived')}` : ''}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
