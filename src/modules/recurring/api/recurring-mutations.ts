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

type UpdateRecurring = components['schemas']['UpdateRecurringTransactionDto'];

function useInvalidateRecurring(spaceId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['recurring', spaceId] });
}

export function useUpdateRecurring(spaceId: string) {
  const invalidate = useInvalidateRecurring(spaceId);
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateRecurring }) => {
      const { data, error } = await api.PATCH('/api/spaces/{spaceId}/recurring/{recurringId}', {
        params: { path: { spaceId, recurringId: id } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function usePauseRecurring(spaceId: string) {
  const invalidate = useInvalidateRecurring(spaceId);
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.PATCH(
        '/api/spaces/{spaceId}/recurring/{recurringId}/pause',
        { params: { path: { spaceId, recurringId: id } } },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useResumeRecurring(spaceId: string) {
  const invalidate = useInvalidateRecurring(spaceId);
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.PATCH(
        '/api/spaces/{spaceId}/recurring/{recurringId}/resume',
        { params: { path: { spaceId, recurringId: id } } },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteRecurring(spaceId: string) {
  const invalidate = useInvalidateRecurring(spaceId);
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/api/spaces/{spaceId}/recurring/{recurringId}', {
        params: { path: { spaceId, recurringId: id } },
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
