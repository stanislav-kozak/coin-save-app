'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createContext, useContext, useOptimistic, useState, type ReactNode } from 'react';
import type { PendingSpend } from '@/modules/categories';
import { CreateWalletDialog, useWallets } from '@/modules/wallets';
import { ExpenseDialog } from './expense-dialog';
import { IncomeDialog } from './income-dialog';

type Prefill = { walletId: string; categoryId: string };
type Launcher = {
  /** Open "Нова витрата" (prefilled after a drop); with no wallets, asks to add one first. */
  openExpense: (prefill?: Prefill) => void;
  openAddWallet: () => void;
  /** Open "Новий дохід" for a wallet (its "+" on desktop, a tap on its circle on mobile). */
  openIncome: (walletId: string) => void;
  /** Expenses being saved, for category totals to show at once; empty again once the server answers. */
  pendingSpends: PendingSpend[];
};

const LauncherContext = createContext<Launcher | null>(null);

/** One place that owns the expense and add-wallet dialogs, shared by drag-and-drop and the FAB. */
export function ExpenseLauncherProvider({
  spaceId,
  children,
}: {
  spaceId: string;
  children: ReactNode;
}) {
  const wallets = useWallets(spaceId);
  const [prefill, setPrefill] = useState<Prefill | undefined>();
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  // The wallet stays set after closing, so a save that fails can reopen the dialog for it.
  const [incomeWallet, setIncomeWallet] = useState('');
  const [incomeOpen, setIncomeOpen] = useState(false);
  // Lives only while the dialog's save transition runs: reverts by itself on success (fresh analytics
  // arrive first) and on failure.
  const [pendingSpends, addPendingSpend] = useOptimistic<PendingSpend[], PendingSpend>(
    [],
    (list, spend) => [...list, spend],
  );

  const launcher: Launcher = {
    openExpense: (next) => {
      if (!next && wallets.data?.length === 0) {
        setWalletOpen(true); // nothing to pay from yet
        return;
      }
      setPrefill(next);
      setExpenseOpen(true);
    },
    openAddWallet: () => setWalletOpen(true),
    openIncome: (walletId) => {
      setIncomeWallet(walletId);
      setIncomeOpen(true);
    },
    pendingSpends,
  };

  return (
    <LauncherContext.Provider value={launcher}>
      {children}
      <ExpenseDialog
        spaceId={spaceId}
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        prefill={prefill}
        onPendingSpend={addPendingSpend}
      />
      <IncomeDialog
        spaceId={spaceId}
        walletId={incomeWallet}
        open={incomeOpen}
        onOpenChange={setIncomeOpen}
      />
      <CreateWalletDialog spaceId={spaceId} open={walletOpen} onOpenChange={setWalletOpen} />
    </LauncherContext.Provider>
  );
}

export function useExpenseLauncher(): Launcher {
  const launcher = useContext(LauncherContext);
  if (!launcher) throw new Error('useExpenseLauncher must be used inside ExpenseLauncherProvider');
  return launcher;
}

/** Mobile "+" (Figma 10:177): a raised accent circle in the bottom nav. */
export function NewExpenseButton() {
  const t = useTranslations('expenses.create');
  const { openExpense } = useExpenseLauncher();
  return (
    <button
      type="button"
      aria-label={t('title')}
      onClick={() => openExpense()}
      className="-mt-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card-raised outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Plus aria-hidden className="size-6" />
    </button>
  );
}
