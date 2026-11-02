import { useMutation } from '@tanstack/react-query';
import type { components } from '@/generated/api';
import { api } from '@/shared/lib/api-client';
import { useInvalidateMoney } from './expenses-mutations';

type CreateTransfer = components['schemas']['CreateTransferDto'];
type UpdateTransfer = components['schemas']['UpdateTransferDto'];

/*
 * Transfers between wallets (type TRANSFER). Not optimistic: with two currencies the received amount
 * is the server's conversion, and both balances must come out exact.
 */

export function useCreateTransfer(spaceId: string) {
  const invalidate = useInvalidateMoney(spaceId);
  return useMutation({
    mutationFn: async (body: CreateTransfer) => {
      const { data, error } = await api.POST('/api/spaces/{spaceId}/transfers', {
        params: { path: { spaceId } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateTransfer(spaceId: string) {
  const invalidate = useInvalidateMoney(spaceId);
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateTransfer }) => {
      const { data, error } = await api.PATCH('/api/spaces/{spaceId}/transfers/{transferId}', {
        params: { path: { spaceId, transferId: id } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTransfer(spaceId: string) {
  const invalidate = useInvalidateMoney(spaceId);
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/api/spaces/{spaceId}/transfers/{transferId}', {
        params: { path: { spaceId, transferId: id } },
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
