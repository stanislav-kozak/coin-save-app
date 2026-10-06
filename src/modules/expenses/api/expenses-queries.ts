import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';
import { recentDays, userTimeZone } from '@/shared/lib/periods';

export const RECENT_DAYS = 3; // spec §6.1: today, yesterday, the day before

export function useRecentExpenses(spaceId: string, now = new Date()) {
  const { from, to } = recentDays(now, RECENT_DAYS);
  return useQuery({
    // Date-only keys: they change exactly at local midnight.
    queryKey: ['expenses', spaceId, from, to],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/spaces/{spaceId}/expenses', {
        params: { path: { spaceId }, query: { from, to, tz: userTimeZone() } },
      });
      if (error) throw error;
      return [...data].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    },
  });
}
