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
        // Room for the "+ income" button the panel lays over the card's right edge.
        withAction && 'pr-12',
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

/** Mobile icon-only wallet (Figma 10:177); a negative balance shows as a red ring. */
export function WalletCircle({ wallet }: { wallet: WalletView }) {
  const locale = useLocale();
  const negative = isNegative(wallet.balance);
  return (
    <span
      className={cn(
        'inline-flex rounded-full',
        negative && 'ring-2 ring-destructive ring-offset-2 ring-offset-background',
      )}
    >
      <EntityIcon
        id={wallet.id}
        color={wallet.color}
        icon={wallet.icon}
        size="l"
        label={`${wallet.name}: ${formatMoney(wallet.balance, wallet.currency, locale)}`}
      />
    </span>
  );
}
