import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';
import { currentMonth } from '@/shared/lib/periods';

/**
 * Active categories by default. `includeArchived` is for labelling history: an archived category keeps
 * its expenses (only DELETE unlinks them). Both keys start with ['categories', spaceId] so one
 * invalidation refreshes both.
 */
export function useCategories(spaceId: string, { includeArchived = false } = {}) {
  return useQuery({
    queryKey: includeArchived ? ['categories', spaceId, 'all'] : ['categories', spaceId],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/spaces/{spaceId}/categories', {
        params: {
          path: { spaceId },
          ...(includeArchived ? { query: { includeArchived: true } } : {}),
        },
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
