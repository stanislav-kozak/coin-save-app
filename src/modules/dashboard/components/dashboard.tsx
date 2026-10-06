'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';
import { CategoriesGrid, useCategories } from '@/modules/categories';
import { ExpenseDialog, RecentExpenses } from '@/modules/expenses';
import { CreateWalletDialog, useWallets, WalletsPanel } from '@/modules/wallets';
import { useIsDesktop } from '@/shared/hooks/use-is-desktop';
import { formatMoney } from '@/shared/lib/money';
import { EntityIcon } from '@/shared/ui/entity-icon';
import { DndProvider } from './dnd-provider';
import { DraggableWallet, DroppableCategory } from './dnd-items';

type Drop = { walletId: string; categoryId: string };

/** Main screen (Figma 10:176 / 10:177): drag a wallet onto a category to add an expense (spec §6.2). */
export function Dashboard({ spaceId }: { spaceId: string }) {
  const locale = useLocale();
  const isDesktop = useIsDesktop();
  const wallets = useWallets(spaceId);
  const categories = useCategories(spaceId);
  const [addingWallet, setAddingWallet] = useState(false);
  const [drop, setDrop] = useState<Drop | null>(null);
  const [expenseOpen, setExpenseOpen] = useState(false);

  const walletById = (id: string) => wallets.data?.find((w) => w.id === id);
  const nameOf = (dndId: string) => {
    const [kind, id] = dndId.split(':');
    const source = kind === 'wallet' ? wallets.data : categories.data;
    return source?.find((x) => x.id === id)?.name ?? '';
  };

  return (
    <DndProvider
      nameOf={nameOf}
      onDrop={(target) => {
        setDrop(target);
        setExpenseOpen(true);
      }}
      renderGhost={(walletId) => {
        const wallet = walletById(walletId);
        if (!wallet) return null;
        // Design system §4.4: elevated shadow + 2° tilt while dragging
        return (
          <div className="flex w-56 rotate-2 items-center gap-3 rounded-card border border-primary bg-card p-3 shadow-card-raised">
            <EntityIcon id={wallet.id} color={wallet.color} icon={wallet.icon} size="m" />
            <div className="min-w-0">
              <p className="truncate text-body font-medium">{wallet.name}</p>
              <p className="text-caption text-muted-foreground">
                {formatMoney(wallet.balance, wallet.currency, locale)}
              </p>
            </div>
          </div>
        );
      }}
    >
      <main className="grid gap-8 px-4 py-6 pb-24 md:grid-cols-[1fr_2fr_1fr] md:px-16 md:pb-8">
        <WalletsPanel
          spaceId={spaceId}
          onAdd={() => setAddingWallet(true)}
          // Only the visible variant (card on desktop, circle on mobile) registers with dnd-kit.
          wrap={(id, node, isCard) =>
            isCard === isDesktop ? <DraggableWallet id={id}>{node}</DraggableWallet> : node
          }
        />
        <CategoriesGrid
          spaceId={spaceId}
          wrap={(id, node, isCard) =>
            isCard === isDesktop ? (
              <DroppableCategory id={id} isCard={isCard}>
                {node}
              </DroppableCategory>
            ) : (
              node
            )
          }
        />
        <RecentExpenses spaceId={spaceId} />
      </main>
      <CreateWalletDialog spaceId={spaceId} open={addingWallet} onOpenChange={setAddingWallet} />
      <ExpenseDialog
        spaceId={spaceId}
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        prefill={drop ?? undefined}
      />
    </DndProvider>
  );
}
