import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type { components } from '@/generated/api';
import { api } from '@/shared/lib/api-client';
import { subtractMoney } from '@/shared/lib/money';
import type { ExpenseDraft } from '../schemas';

type Wallet = components['schemas']['WalletResponseDto'];
type Expense = components['schemas']['ExpenseResponseDto'];
type Snapshot = { wallets?: Wallet[]; expenses: [QueryKey, Expense[] | undefined][] };

export function useCreateExpense(spaceId: string) {
  const queryClient = useQueryClient();
  const walletsKey = ['wallets', spaceId];
  const expensesKey = ['expenses', spaceId];

  return useMutation({
    mutationFn: async (draft: ExpenseDraft) => {
      const { data, error } = await api.POST('/api/spaces/{spaceId}/expenses', {
        params: { path: { spaceId } },
        body: { ...draft, type: 'EXPENSE', occurredAt: new Date().toISOString() },
      });
      if (error) throw error;
      return data;
    },

    // Spec §6.9: show the result immediately, reconcile with the server afterwards.
    onMutate: async (draft): Promise<Snapshot> => {
      await queryClient.cancelQueries({ queryKey: walletsKey });
      await queryClient.cancelQueries({ queryKey: expensesKey });
      const snapshot: Snapshot = {
        wallets: queryClient.getQueryData<Wallet[]>(walletsKey),
        expenses: queryClient.getQueriesData<Expense[]>({ queryKey: expensesKey }),
      };
      const wallet = snapshot.wallets?.find((w) => w.id === draft.walletId);
      queryClient.setQueryData<Wallet[]>(walletsKey, (list) =>
        list?.map((w) =>
          w.id === draft.walletId
            ? { ...w, balance: subtractMoney(w.balance, String(draft.amount)) }
            : w,
        ),
      );
      // Server-only fields (fxRate, amountInPrimary, createdById…) arrive with the refetch.
      const optimistic = {
        id: `optimistic-${crypto.randomUUID()}`,
        spaceId,
        walletId: draft.walletId,
        categoryId: draft.categoryId ?? null,
        type: 'EXPENSE',
        amount: String(draft.amount),
        walletCurrency: wallet?.currency ?? '',
        note: draft.note ?? null,
        occurredAt: new Date().toISOString(),
      } as unknown as Expense;
      for (const [key] of snapshot.expenses) {
        queryClient.setQueryData<Expense[]>(key, (list) => (list ? [optimistic, ...list] : list));
      }
      return snapshot;
    },

    onError: (_error, _draft, snapshot) => {
      if (!snapshot) return;
      queryClient.setQueryData(walletsKey, snapshot.wallets);
      for (const [key, data] of snapshot.expenses) queryClient.setQueryData(key, data);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: walletsKey });
      void queryClient.invalidateQueries({ queryKey: expensesKey });
      void queryClient.invalidateQueries({ queryKey: ['analytics', spaceId] }); // amountInPrimary
    },
  });
}
