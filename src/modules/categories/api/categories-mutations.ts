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

type Category = components['schemas']['CategoryResponseDto'];

/**
 * Spec §6.4: `orderedIds` lists every active category. Shown at once; a refusal restores the previous
 * order (one drag at a time, so the whole snapshot is safe to put back).
 */
export function useReorderCategories(spaceId: string) {
  const queryClient = useQueryClient();
  const key = ['categories', spaceId];
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const { data, error } = await api.PATCH('/api/spaces/{spaceId}/categories/reorder', {
        params: { path: { spaceId } },
        body: { orderedIds },
      });
      if (error) throw error;
      return data;
    },
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: key, exact: true });
      const previous = queryClient.getQueryData<Category[]>(key);
      queryClient.setQueryData<Category[]>(key, (list) => {
        if (!list) return list;
        const byId = new Map(list.map((c) => [c.id, c]));
        return orderedIds.flatMap((id, sortOrder) => {
          const c = byId.get(id);
          return c ? [{ ...c, sortOrder }] : [];
        });
      });
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories', spaceId] }),
  });
}
