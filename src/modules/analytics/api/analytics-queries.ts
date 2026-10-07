import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';
import { userTimeZone } from '@/shared/lib/periods';
import type { Period } from '../lib/period';

/**
 * Spec §10.2. Key `['analytics', spaceId, from, to]` (+ the wallet filter); realtime and mutations
 * invalidate the `['analytics', spaceId]` prefix. While another period loads, the last one stays on
 * screen (`isPlaceholderData`) instead of a skeleton.
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
    // Only within the same space: another space's totals (and currency) must never show.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === spaceId ? previous : undefined,
  });
}
