import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';
import { currentMonth } from '@/shared/lib/periods';

export function useCategories(spaceId: string) {
  return useQuery({
    queryKey: ['categories', spaceId],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/spaces/{spaceId}/categories', {
        params: { path: { spaceId } },
      });
      if (error) throw error;
      return [...data].sort((a, b) => a.sortOrder - b.sortOrder);
    },
  });
}

/** This month's spending per category, in the space's primary currency. */
export function useMonthAnalytics(spaceId: string, now = new Date()) {
  const { from } = currentMonth(now);
  return useQuery({
    // Keyed by the month start only: `to` is "now" at fetch time, not a new key every render.
    queryKey: ['analytics', spaceId, from],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/spaces/{spaceId}/analytics', {
        params: { path: { spaceId }, query: { from, to: new Date().toISOString() } },
      });
      if (error) throw error;
      return data;
    },
  });
}
