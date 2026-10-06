import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';
import type { CreateWalletValues } from '../schemas';

export function useWallets(spaceId: string) {
  return useQuery({
    queryKey: ['wallets', spaceId],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/spaces/{spaceId}/wallets', {
        params: { path: { spaceId } },
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
