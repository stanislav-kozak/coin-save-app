import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/generated/api';
import { api } from '@/shared/lib/api-client';

type CreateRecurring = components['schemas']['CreateRecurringTransactionDto'];

export function useCreateRecurring(spaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateRecurring) => {
      const { data, error } = await api.POST('/api/spaces/{spaceId}/recurring', {
        params: { path: { spaceId } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['recurring', spaceId] }),
  });
}
