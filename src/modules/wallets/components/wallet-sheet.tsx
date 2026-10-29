'use client';

import { Pencil, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { isNegative } from '@/shared/lib/money';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { CountUpMoney } from '@/shared/ui/count-up-money';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { EntityIcon } from '@/shared/ui/entity-icon';
import type { WalletView } from './wallet-card';

type Props = {
  wallet: WalletView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddIncome?: () => void;
  onEdit: () => void;
};

/** Mobile: a tap on a wallet circle opens its actions (add income, edit) in a bottom sheet. */
export function WalletSheet({ wallet, open, onOpenChange, onAddIncome, onEdit }: Props) {
  const t = useTranslations('wallets.sheet');
  const tc = useTranslations('common');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={wallet.name} closeLabel={tc('close')}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <EntityIcon id={wallet.id} color={wallet.color} icon={wallet.icon} size="l" />
            <p
              className={cn(
                'min-w-0 flex-1 truncate text-money',
                isNegative(wallet.balance) && 'text-destructive',
              )}
            >
              <CountUpMoney value={wallet.balance} currency={wallet.currency} />
            </p>
            <Badge tone="neutral">{wallet.currency}</Badge>
          </div>
          <div className={cn('grid gap-3', onAddIncome && 'grid-cols-2')}>
            {onAddIncome ? (
              <Button onClick={onAddIncome}>
                <Plus aria-hidden className="size-4" />
                {t('income')}
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onEdit}>
              <Pencil aria-hidden className="size-4" />
              {t('edit')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
