import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';

export const currentUserQuery = queryOptions({
  queryKey: ['me'],
  queryFn: async () => {
    const { data, error } = await api.GET('/api/auth/me');
    if (error) throw error;
    return data;
  },
});

/** The signed-in user. A dead session ends in refresh 401 → `session` cookie cleared → login. */
export function useCurrentUser() {
  return useQuery(currentUserQuery);
}
