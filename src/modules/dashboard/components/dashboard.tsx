'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { CategoriesGrid, useCategories } from '@/modules/categories';
import { RecentExpenses, useExpenseLauncher } from '@/modules/expenses';
import { useWallets, WalletsPanel } from '@/modules/wallets';
import { useIsDesktop } from '@/shared/hooks/use-is-desktop';
import { getErrorCode } from '@/shared/lib/api-error';
import { formatMoney } from '@/shared/lib/money';
import { EntityIcon } from '@/shared/ui/entity-icon';
import { DndProvider } from './dnd-provider';
import { DraggableWallet, SortableCategory } from './dnd-items';
import { categoryDndId } from '../lib/resolve-drop';
import { resolveReorder } from '../lib/resolve-reorder';
import { useDroppedOrder } from '../lib/use-dropped-order';

/** Main screen (Figma 10:176 / 10:177): drag a wallet onto a category to add an expense (spec §6.2). */
export function Dashboard({ spaceId }: { spaceId: string }) {
  const locale = useLocale();
  const te = useTranslations('errors');
  const isDesktop = useIsDesktop();
  const wallets = useWallets(spaceId);
  const categories = useCategories(spaceId);
  const { openExpense, openAddWallet, openIncome, pendingSpends } = useExpenseLauncher();

  const dropped = useDroppedOrder(spaceId);
  const [tappedCategory, setTappedCategory] = useState<string | null>(null);
  const order = dropped.order;
  const categoryIds = order ?? categories.data?.map((c) => c.id) ?? [];

  const walletById = (id: string) => wallets.data?.find((w) => w.id === id);
  const nameOf = (dndId: string) => {
    const [kind, id] = dndId.split(':');
    const source = kind === 'wallet' ? wallets.data : categories.data;
    return source?.find((x) => x.id === id)?.name ?? '';
  };

  return (
    <DndProvider
      nameOf={nameOf}
      onDrop={openExpense}
      onReorder={(activeId, overId) => {
        const next = resolveReorder(activeId, overId, categoryIds);
        if (next) dropped.apply(next);
      }}
      onTap={(dndId) => {
        const [kind, id] = dndId.split(':');
        if (kind === 'wallet') openIncome(id!);
        else setTappedCategory(id!);
      }}
      renderGhost={(dndId) => {
        const [kind, id] = dndId.split(':');
        // A category is reordered in place (the card itself moves): sortable keyboard coordinates
        // assume the dragged rect is the item's own, which a smaller tilted ghost breaks.
        if (kind === 'category') return null;
        const wallet = walletById(id);
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
          onAdd={openAddWallet}
          onAddIncome={openIncome}
          // Only the visible variant (card on desktop, circle on mobile) registers with dnd-kit.
          wrap={(id, node, isCard, onActivate) =>
            isCard === isDesktop ? (
              <DraggableWallet id={id} onClick={onActivate}>
                {node}
              </DraggableWallet>
            ) : (
              node
            )
          }
        />
        <SortableContext items={categoryIds.map(categoryDndId)} strategy={rectSortingStrategy}>
          <CategoriesGrid
            spaceId={spaceId}
            pending={pendingSpends}
            order={order ?? undefined}
            notice={dropped.error ? te(getErrorCode(dropped.error)) : undefined}
            editRequest={tappedCategory}
            onEditRequestHandled={() => setTappedCategory(null)}
            wrap={(id, render, isCard) =>
              isCard === isDesktop ? (
                <SortableCategory id={id} isCard={isCard}>
                  {render}
                </SortableCategory>
              ) : (
                render()
              )
            }
          />
        </SortableContext>
        <RecentExpenses spaceId={spaceId} />
      </main>
    </DndProvider>
  );
}
