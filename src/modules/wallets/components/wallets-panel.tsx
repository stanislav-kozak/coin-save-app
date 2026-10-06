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
  /** Lets the dashboard make each wallet draggable without this module knowing about drag-and-drop. */
  wrap?: (walletId: string, node: ReactNode, isCard: boolean) => ReactNode;
};

export function WalletsPanel({ spaceId, onAdd, wrap = (_id, node) => node }: Props) {
  const t = useTranslations('wallets');
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
            {wallets.data.map((w) => (
              <li key={w.id}>{wrap(w.id, <WalletCircle wallet={w} />, false)}</li>
            ))}
          </ul>
          <ul className="hidden flex-col gap-3 md:flex">
            {wallets.data.map((w) => (
              <li key={w.id}>{wrap(w.id, <WalletCard wallet={w} />, true)}</li>
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
