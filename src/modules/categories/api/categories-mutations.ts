import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/generated/api';
import { api } from '@/shared/lib/api-client';

type CreateBody = components['schemas']['CreateCategoryDto'];
type UpdateBody = components['schemas']['UpdateCategoryDto'];

/** Category changes move the grid and the month's totals; archive/delete also relabel history rows. */
function useInvalidate(spaceId: string, { history = false } = {}) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['categories', spaceId] }),
      queryClient.invalidateQueries({ queryKey: ['analytics', spaceId] }),
      ...(history ? [queryClient.invalidateQueries({ queryKey: ['expenses', spaceId] })] : []),
    ]);
}

export function useCreateCategory(spaceId: string) {
  const invalidate = useInvalidate(spaceId);
  return useMutation({
    mutationFn: async (body: CreateBody) => {
      const { data, error } = await api.POST('/api/spaces/{spaceId}/categories', {
        params: { path: { spaceId } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateCategory(spaceId: string) {
  const invalidate = useInvalidate(spaceId);
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateBody }) => {
      const { data, error } = await api.PATCH('/api/spaces/{spaceId}/categories/{categoryId}', {
        params: { path: { spaceId, categoryId: id } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useArchiveCategory(spaceId: string) {
  const invalidate = useInvalidate(spaceId, { history: true });
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.PATCH(
        '/api/spaces/{spaceId}/categories/{categoryId}/archive',
        { params: { path: { spaceId, categoryId: id } } },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteCategory(spaceId: string) {
  const invalidate = useInvalidate(spaceId, { history: true });
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/api/spaces/{spaceId}/categories/{categoryId}', {
        params: { path: { spaceId, categoryId: id } },
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
