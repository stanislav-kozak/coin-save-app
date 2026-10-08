import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/generated/api';
import { api } from '@/shared/lib/api-client';

/** `PATCH /api/users/me` (name, saved language). The answer is the new current user (`['me']`). */
export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['UpdateMeDto']) => {
      const { data, error } = await api.PATCH('/api/users/me', { body });
      if (error) throw error;
      return data;
    },
    onSuccess: (me) => queryClient.setQueryData(['me'], me),
  });
}
