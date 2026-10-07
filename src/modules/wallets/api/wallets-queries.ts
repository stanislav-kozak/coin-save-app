import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';
import type { CreateWalletValues, UpdateWalletValues } from '../schemas';

/** Active wallets by default; `includeArchived` (settings) also lists archived ones to restore. */
export function useWallets(spaceId: string, { includeArchived = false } = {}) {
  return useQuery({
    queryKey: includeArchived ? ['wallets', spaceId, 'all'] : ['wallets', spaceId],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/spaces/{spaceId}/wallets', {
        params: {
          path: { spaceId },
          ...(includeArchived ? { query: { includeArchived: true } } : {}),
        },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateWallet(spaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateWalletValues) => {
      const { data, error } = await api.POST('/api/spaces/{spaceId}/wallets', {
        params: { path: { spaceId } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets', spaceId] }),
  });
}

/** Wallet changes move balances and the archived list; recent rows show wallet names too. */
function useInvalidateWallets(spaceId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['wallets', spaceId] });
}

export function useUpdateWallet(spaceId: string) {
  const invalidate = useInvalidateWallets(spaceId);
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateWalletValues }) => {
      const { data, error } = await api.PATCH('/api/spaces/{spaceId}/wallets/{walletId}', {
        params: { path: { spaceId, walletId: id } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useArchiveWallet(spaceId: string) {
  const invalidate = useInvalidateWallets(spaceId);
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.PATCH('/api/spaces/{spaceId}/wallets/{walletId}/archive', {
        params: { path: { spaceId, walletId: id } },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useUnarchiveWallet(spaceId: string) {
  const invalidate = useInvalidateWallets(spaceId);
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.PATCH(
        '/api/spaces/{spaceId}/wallets/{walletId}/unarchive',
        { params: { path: { spaceId, walletId: id } } },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}
