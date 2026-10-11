import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { api } from '@/shared/lib/api-client';
import type { Locale } from '@/shared/i18n/routing';
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
  // The default categories come out in the UI language (without it: the account's saved language).
  const locale = useLocale() as Locale;
  return useMutation({
    mutationFn: async ({ name, currency }: CreateSpaceValues) => {
      const { data: space, error } = await api.POST('/api/spaces', { body: { name, locale } });
      if (error) throw error;
      // POST takes no currency; the server picks the default one (EUR at the time of writing).
      if (currency !== space.primaryCurrency) {
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
