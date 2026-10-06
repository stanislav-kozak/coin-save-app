import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';

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
