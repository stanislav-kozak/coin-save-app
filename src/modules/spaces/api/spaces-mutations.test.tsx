import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useAcceptInvitation,
  useDeleteSpace,
  useInvite,
  useLeaveSpace,
  useRemoveMember,
  useRevokeInvitation,
  useUpdateSpace,
} from './spaces-mutations';

const api = { POST: vi.fn(), PATCH: vi.fn(), DELETE: vi.fn() };
vi.mock('@/shared/lib/api-client', () => ({
  api: {
    POST: (...a: unknown[]) => api.POST(...a),
    PATCH: (...a: unknown[]) => api.PATCH(...a),
    DELETE: (...a: unknown[]) => api.DELETE(...a),
  },
}));
const forget = vi.fn();
vi.mock('../lib/last-space', () => ({ lastSpace: { forget: (id: string) => forget(id) } }));

beforeEach(() => {
  for (const m of [api.POST, api.PATCH, api.DELETE, forget]) m.mockReset();
  for (const m of [api.POST, api.PATCH, api.DELETE])
    m.mockResolvedValue({ data: { spaceId: 'sp2' } });
});

function setup<T>(hook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const remove = vi.spyOn(queryClient, 'removeQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(hook, { wrapper });
  const keys = () => invalidate.mock.calls.map((c) => c[0]?.queryKey);
  return { result, keys, remove };
}
const path = (extra = {}) => ({ params: { path: { spaceId: 'sp1', ...extra } } });

describe('space hooks', () => {
  it('renames the space and refreshes the list and the space', async () => {
    const { result, keys } = setup(() => useUpdateSpace('sp1'));
    await act(() => result.current.mutateAsync({ name: 'Сім’я' }));
    expect(api.PATCH).toHaveBeenCalledWith('/api/spaces/{spaceId}', {
      ...path(),
      body: { name: 'Сім’я' },
    });
    expect(keys()).toEqual(expect.arrayContaining([['spaces'], ['spaces', 'sp1']]));
  });

  it('deletes and leaves a space, forgetting it as the last one', async () => {
    const del = setup(() => useDeleteSpace('sp1'));
    await act(() => del.result.current.mutateAsync());
    expect(api.DELETE).toHaveBeenCalledWith('/api/spaces/{spaceId}', path());
    expect(del.remove).toHaveBeenCalledWith({ queryKey: ['spaces', 'sp1'] });
    const leave = setup(() => useLeaveSpace('sp1'));
    await act(() => leave.result.current.mutateAsync());
    expect(api.POST).toHaveBeenCalledWith('/api/spaces/{spaceId}/leave', path());
    expect(forget.mock.calls).toEqual([['sp1'], ['sp1']]);
  });

  it('removes members and manages invitations', async () => {
    const remove = setup(() => useRemoveMember('sp1'));
    await act(() => remove.result.current.mutateAsync('m1'));
    expect(api.DELETE).toHaveBeenCalledWith(
      '/api/spaces/{spaceId}/members/{membershipId}',
      path({ membershipId: 'm1' }),
    );
    expect(remove.keys()).toContainEqual(['members', 'sp1']);

    const invite = setup(() => useInvite('sp1'));
    await act(() => invite.result.current.mutateAsync({ email: 'a@b.c' }));
    expect(api.POST).toHaveBeenCalledWith('/api/spaces/{spaceId}/invitations', {
      ...path(),
      body: { email: 'a@b.c' },
    });
    expect(invite.keys()).toContainEqual(['invitations', 'sp1']);

    const revoke = setup(() => useRevokeInvitation('sp1'));
    await act(() => revoke.result.current.mutateAsync('i1'));
    expect(api.DELETE).toHaveBeenCalledWith(
      '/api/spaces/{spaceId}/invitations/{invitationId}',
      path({ invitationId: 'i1' }),
    );
  });

  it('accepts an invitation and refreshes the spaces list', async () => {
    const { result, keys } = setup(() => useAcceptInvitation());
    let membership: unknown;
    await act(async () => {
      membership = await result.current.mutateAsync('tok');
    });
    expect(api.POST).toHaveBeenCalledWith('/api/invitations/accept', { body: { token: 'tok' } });
    expect(membership).toEqual({ spaceId: 'sp2' });
    expect(keys()).toContainEqual(['spaces']);
  });
});
