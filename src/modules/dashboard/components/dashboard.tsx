'use client';

import { CategoriesGrid } from '@/modules/categories';
import { RecentExpenses } from '@/modules/expenses';
import { WalletsPanel } from '@/modules/wallets';

/** Main screen (Figma 10:176 / 10:177): wallets · categories · recent transactions. */
export function Dashboard({ spaceId }: { spaceId: string }) {
  return (
    <main className="grid gap-8 px-4 py-6 pb-24 md:grid-cols-[1fr_2fr_1fr] md:px-16 md:pb-8">
      <WalletsPanel spaceId={spaceId} onAdd={() => {}} />
      <CategoriesGrid spaceId={spaceId} />
      <RecentExpenses spaceId={spaceId} />
    </main>
  );
}
