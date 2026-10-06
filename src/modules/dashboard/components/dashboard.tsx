'use client';

import { useState } from 'react';
import { CategoriesGrid } from '@/modules/categories';
import { RecentExpenses } from '@/modules/expenses';
import { CreateWalletDialog, WalletsPanel } from '@/modules/wallets';

/** Main screen (Figma 10:176 / 10:177): wallets · categories · recent transactions. */
export function Dashboard({ spaceId }: { spaceId: string }) {
  const [addingWallet, setAddingWallet] = useState(false);
  return (
    <main className="grid gap-8 px-4 py-6 pb-24 md:grid-cols-[1fr_2fr_1fr] md:px-16 md:pb-8">
      <WalletsPanel spaceId={spaceId} onAdd={() => setAddingWallet(true)} />
      <CategoriesGrid spaceId={spaceId} />
      <RecentExpenses spaceId={spaceId} />
      <CreateWalletDialog spaceId={spaceId} open={addingWallet} onOpenChange={setAddingWallet} />
    </main>
  );
}
