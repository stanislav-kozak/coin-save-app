import { useLocale } from 'next-intl';
import { formatMoney, isNegative } from '@/shared/lib/money';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { EntityIcon } from '@/shared/ui/entity-icon';

export type WalletView = {
  id: string;
  name: string;
  currency: string;
  balance: string;
  icon?: string | null;
  color?: string | null;
};

/** Desktop wallet card (Figma 8:144). Negative balances in red (spec §6.8). */
export function WalletCard({ wallet, withAction }: { wallet: WalletView; withAction?: boolean }) {
  const locale = useLocale();
  return (
    <article
      className={cn(
        'flex items-center gap-3 rounded-card border border-border bg-card p-4 shadow-card',
        // Room for the panel's buttons (edit, + income) laid over the card's right edge.
        withAction && 'pr-20',
      )}
    >
      <EntityIcon id={wallet.id} color={wallet.color} icon={wallet.icon} size="l" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-body font-medium">{wallet.name}</h3>
        <p className={cn('truncate text-money', isNegative(wallet.balance) && 'text-destructive')}>
          {formatMoney(wallet.balance, wallet.currency, locale)}
        </p>
      </div>
      <Badge tone="neutral">{wallet.currency}</Badge>
    </article>
  );
}

/**
 * Mobile wallet: the circle with its name and balance underneath (user request over Figma 10:177's
 * icon-only circle — the balance must be visible without dragging). Negative balances in red.
 */
export function WalletCircle({ wallet }: { wallet: WalletView }) {
  const locale = useLocale();
  const negative = isNegative(wallet.balance);
  return (
    <span className="flex w-20 flex-col items-center gap-1 text-center">
      <EntityIcon id={wallet.id} color={wallet.color} icon={wallet.icon} size="l" />
      <span className="w-full truncate text-caption font-medium text-foreground">
        {wallet.name}
      </span>
      <span
        className={cn(
          'w-full truncate text-caption tabular-nums',
          negative ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {formatMoney(wallet.balance, wallet.currency, locale)}
      </span>
    </span>
  );
}
