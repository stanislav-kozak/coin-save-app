'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { SectionError } from '@/shared/ui/section-error';
import { useWallets } from '../api/wallets-queries';
import { WalletCard, WalletCircle } from './wallet-card';

type Props = {
  spaceId: string;
  onAdd: () => void;
  /** "+" on a desktop card / a tap on a mobile circle: add income to that wallet (spec §6.3). */
  onAddIncome?: (walletId: string) => void;
  /**
   * Lets the dashboard make each wallet draggable without this module knowing about drag-and-drop.
   * `onActivate` is the circle's tap action, for the wrapper to attach when it owns the element.
   */
  wrap?: (walletId: string, node: ReactNode, isCard: boolean, onActivate?: () => void) => ReactNode;
};

export function WalletsPanel({ spaceId, onAdd, onAddIncome, wrap }: Props) {
  const t = useTranslations('wallets');
  const ti = useTranslations('expenses.income');
  const td = useTranslations('dashboard');
  const wallets = useWallets(spaceId);
  if (wallets.isError && !wallets.isFetching) {
    return (
      <section aria-labelledby="wallets-title" className="flex flex-col gap-4">
        <h2 id="wallets-title" className="text-h2">
          {td('wallets')}
        </h2>
        <SectionError error={wallets.error} onRetry={() => void wallets.refetch()} />
      </section>
    );
  }
  if (!wallets.data) return null;

  const addButton = (
    <Button variant="secondary" size="s" className="w-full" onClick={onAdd}>
      <Plus aria-hidden className="size-4" />
      {t('add')}
    </Button>
  );

  return (
    <section aria-labelledby="wallets-title" className="flex flex-col gap-4">
      <h2 id="wallets-title" className="text-h2">
        {td('wallets')}
      </h2>
      {wallets.data.length === 0 ? (
        <EmptyState title={t('emptyTitle')} text={t('emptyText')} action={addButton} />
      ) : (
        <>
          <ul className="flex gap-4 overflow-x-auto p-1 md:hidden">
            {wallets.data.map((w) => {
              const activate = onAddIncome ? () => onAddIncome(w.id) : undefined;
              const circle = <WalletCircle wallet={w} />;
              return (
                <li key={w.id}>
                  {wrap ? (
                    wrap(w.id, circle, false, activate)
                  ) : (
                    <button
                      type="button"
                      onClick={activate}
                      aria-label={ti('addFor', { name: w.name })}
                      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      {circle}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <ul className="hidden flex-col gap-3 md:flex">
            {wallets.data.map((w) => (
              <li key={w.id} className="relative">
                {wrap ? (
                  wrap(w.id, <WalletCard wallet={w} withAction={!!onAddIncome} />, true)
                ) : (
                  <WalletCard wallet={w} withAction={!!onAddIncome} />
                )}
                {onAddIncome ? (
                  // A sibling of the (draggable) card, not inside it: no nested interactive elements.
                  <button
                    type="button"
                    aria-label={ti('addFor', { name: w.name })}
                    onClick={() => onAddIncome(w.id)}
                    className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-primary/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <Plus aria-hidden className="size-4" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1 self-start text-caption font-medium text-primary"
          >
            <Plus aria-hidden className="size-4" />
            {t('add')}
          </button>
        </>
      )}
    </section>
  );
}
