import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';
import { userTimeZone } from '@/shared/lib/periods';
import type { Period } from '../lib/period';

/**
 * Spec §10.2. Key `['analytics', spaceId, from, to]` (+ the wallet filter): without a filter it shares
 * the dashboard's month cache; realtime and mutations invalidate the `['analytics', spaceId]` prefix.
 */
export function useAnalytics(spaceId: string, period: Period, walletIds: string[]) {
  const { from, to } = period;
  return useQuery({
    queryKey:
      walletIds.length > 0
        ? ['analytics', spaceId, from, to, walletIds.join(',')]
        : ['analytics', spaceId, from, to],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/spaces/{spaceId}/analytics', {
        params: {
          path: { spaceId },
          query: { from, to, tz: userTimeZone(), ...(walletIds.length > 0 ? { walletIds } : {}) },
        },
      });
      if (error) throw error;
      return data;
    },
  });
}
