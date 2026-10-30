'use client';

import { useLocale, useTranslations } from 'next-intl';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { CategoriesGrid, useCategories } from '@/modules/categories';
import { RecentExpenses, useExpenseLauncher } from '@/modules/expenses';
import { useWallets, WalletsPanel } from '@/modules/wallets';
import { InstallBanner } from '@/modules/pwa';
import { useIsDesktop } from '@/shared/hooks/use-is-desktop';
import { getErrorCode } from '@/shared/lib/api-error';
import { formatMoney } from '@/shared/lib/money';
import { EntityIcon } from '@/shared/ui/entity-icon';
import { DndProvider } from './dnd-provider';
import { MonthCard } from './month-card';
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
      renderGhost={(dndId) => {
        const [kind, id] = dndId.split(':');
        // A category is reordered in place (the card itself moves): sortable keyboard coordinates
        // assume the dragged rect is the item's own, which a smaller tilted ghost breaks.
        if (kind === 'category') return null;
        const wallet = walletById(id);
        if (!wallet) return null;
        // On a phone the ghost is the wallet's circle under the finger: a card would cover the tiles.
        if (!isDesktop) {
          return (
            <span className="inline-flex rotate-2 rounded-full shadow-card-raised ring-2 ring-primary">
              <EntityIcon id={wallet.id} color={wallet.color} icon={wallet.icon} size="l" />
            </span>
          );
        }
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
      {/*
        Phones and tablets (< 1024): one column — month, wallets, categories, recent.
        1024–1439: wallets with the recent list under them on the left, categories on the right.
        1440+ (the design width): three columns; the wallets one keeps room for a whole balance.
      */}
      <main className="grid items-start gap-8 px-4 py-6 md:px-6 md:pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:px-8 xl:px-16 min-[90rem]:grid-cols-[minmax(21.5rem,1fr)_minmax(0,2fr)_minmax(0,1fr)]">
        <MonthCard spaceId={spaceId} />
        <InstallBanner />
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
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
        </div>
        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-2 min-[90rem]:row-span-1">
          <SortableContext items={categoryIds.map(categoryDndId)} strategy={rectSortingStrategy}>
            <CategoriesGrid
              spaceId={spaceId}
              pending={pendingSpends}
              order={order ?? undefined}
              notice={dropped.error ? te(getErrorCode(dropped.error)) : undefined}
              wrap={(id, render, isCard) =>
                isCard === isDesktop ? (
                  <SortableCategory id={id}>{render}</SortableCategory>
                ) : (
                  render()
                )
              }
            />
          </SortableContext>
        </div>
        <div className="min-w-0 lg:col-start-1 lg:row-start-3 min-[90rem]:col-start-3 min-[90rem]:row-start-2">
          <RecentExpenses spaceId={spaceId} />
        </div>
      </main>
    </DndProvider>
  );
}
