import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type { components } from '@/generated/api';
import { api } from '@/shared/lib/api-client';
import { addMoney, subtractMoney } from '@/shared/lib/money';
import { dayKey } from '@/shared/lib/periods';
import type { ExpenseDraft } from '../schemas';

type Wallet = components['schemas']['WalletResponseDto'];
type Expense = components['schemas']['ExpenseResponseDto'];
/** What this create changed optimistically, so a failure undoes exactly that (not other pending creates). */
type Applied = { optimisticId: string; lists: QueryKey[] };

/** `['expenses', spaceId, from, to]` lists whose period contains today get the new row. */
function includesToday(key: QueryKey, today: string): boolean {
  const [, , from, to] = key;
  return typeof from === 'string' && typeof to === 'string' && from <= today && today <= to;
}

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
    onMutate: async (draft): Promise<Applied> => {
      await queryClient.cancelQueries({ queryKey: walletsKey });
      await queryClient.cancelQueries({ queryKey: expensesKey });
      const wallet = queryClient
        .getQueryData<Wallet[]>(walletsKey)
        ?.find((w) => w.id === draft.walletId);
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
      const today = dayKey(new Date());
      const lists = queryClient
        .getQueriesData<Expense[]>({ queryKey: expensesKey })
        .filter(([key, list]) => list && includesToday(key, today))
        .map(([key]) => key);
      for (const key of lists) {
        queryClient.setQueryData<Expense[]>(key, (list) => (list ? [optimistic, ...list] : list));
      }
      return { optimisticId: optimistic.id, lists };
    },

    onError: (_error, draft, applied) => {
      if (!applied) return;
      queryClient.setQueryData<Wallet[]>(walletsKey, (list) =>
        list?.map((w) =>
          w.id === draft.walletId
            ? { ...w, balance: addMoney(w.balance, String(draft.amount)) }
            : w,
        ),
      );
      for (const key of applied.lists) {
        queryClient.setQueryData<Expense[]>(key, (list) =>
          list?.filter((e) => e.id !== applied.optimisticId),
        );
      }
    },

    // Returned, so `mutateAsync` settles only once the fresh data is in (the dialog's optimistic
    // category totals last exactly until then).
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: walletsKey }),
        queryClient.invalidateQueries({ queryKey: expensesKey }),
        queryClient.invalidateQueries({ queryKey: ['analytics', spaceId] }), // amountInPrimary
      ]),
  });
}
