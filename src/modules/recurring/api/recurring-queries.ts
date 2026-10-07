import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';

/** All rules incl. paused ones (they must stay visible to be resumed). Realtime: `recurring.changed`. */
export function useRecurring(spaceId: string) {
  return useQuery({
    queryKey: ['recurring', spaceId],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/spaces/{spaceId}/recurring', {
        params: { path: { spaceId }, query: { includeInactive: true } },
      });
      if (error) throw error;
      return data;
    },
  });
}
