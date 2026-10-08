import { useQuery } from '@tanstack/react-query';
import type { components } from '@/generated/api';
import { api } from '@/shared/lib/api-client';

type Currency = components['schemas']['Currency'];

/** Today's rate `from` → `to` (the one the server converts with); nothing is fetched for one currency. */
export function useRate(from: Currency, to: Currency) {
  return useQuery({
    queryKey: ['rate', from, to],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/currencies/rate', {
        params: { query: { from, to } },
      });
      if (error) throw error;
      return data;
    },
    enabled: from !== to,
    staleTime: 10 * 60_000,
  });
}
