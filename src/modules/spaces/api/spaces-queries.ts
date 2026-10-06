import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_CURRENCY } from '@/shared/constants/currencies';
import { api } from '@/shared/lib/api-client';
import type { CreateSpaceValues } from '../schemas';

export function useSpaces() {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/spaces');
      if (error) throw error;
      return data;
    },
  });
}

export function useSpace(spaceId: string) {
  return useQuery({
    queryKey: ['spaces', spaceId],
    retry: false, // 403/404 are answers, not glitches
    queryFn: async () => {
      const { data, error } = await api.GET('/api/spaces/{spaceId}', {
        params: { path: { spaceId } },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, currency }: CreateSpaceValues) => {
      const { data: space, error } = await api.POST('/api/spaces', { body: { name } });
      if (error) throw error;
      if (currency !== DEFAULT_CURRENCY) {
        try {
          const { data: updated } = await api.PATCH('/api/spaces/{spaceId}', {
            params: { path: { spaceId: space.id } },
            body: { primaryCurrency: currency },
          });
          if (updated) return updated;
        } catch {
          // The space exists either way; the currency can be changed in settings. Never block here,
          // or the user would retry and create a duplicate space.
        }
      }
      return space;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  });
}
