import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useUpdateMe } from './use-update-me';

const patch = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { PATCH: (...a: unknown[]) => patch(...a) } }));

describe('useUpdateMe', () => {
  it('patches the profile and puts the answer into the current-user cache', async () => {
    const updated = { id: 'u1', email: 'me@x.y', name: 'Стас', locale: 'uk' };
    patch.mockResolvedValue({ data: updated });
    const queryClient = new QueryClient();
    queryClient.setQueryData(['me'], { ...updated, name: 'Старе' });
    const { result } = renderHook(() => useUpdateMe(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });
    await act(() => result.current.mutateAsync({ name: 'Стас' }));
    expect(patch).toHaveBeenCalledWith('/api/users/me', { body: { name: 'Стас' } });
    expect(queryClient.getQueryData(['me'])).toEqual(updated);
  });
});
