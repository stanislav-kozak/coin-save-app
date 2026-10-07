import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useReorderCategories } from './categories-mutations';

const patch = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { PATCH: (...a: unknown[]) => patch(...a) } }));

beforeEach(() => {
  patch.mockReset();
});

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(
    ['categories', 'sp1'],
    ['a', 'b', 'c'].map((id, sortOrder) => ({ id, name: id, sortOrder })),
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useReorderCategories('sp1'), { wrapper });
  return { queryClient, result };
}
const ids = (qc: QueryClient) =>
  qc.getQueryData<{ id: string }[]>(['categories', 'sp1'])!.map((c) => c.id);

describe('useReorderCategories', () => {
  it('shows the new order at once and restores it if the server refuses', async () => {
    let answer!: (v: unknown) => void;
    patch.mockReturnValue(new Promise((r) => (answer = r)));
    const { queryClient, result } = setup();
    act(() => result.current.mutate(['c', 'a', 'b']));
    await waitFor(() => expect(ids(queryClient)).toEqual(['c', 'a', 'b']));
    expect(patch).toHaveBeenCalledWith('/api/spaces/{spaceId}/categories/reorder', {
      params: { path: { spaceId: 'sp1' } },
      body: { orderedIds: ['c', 'a', 'b'] },
    });
    await act(async () =>
      answer({ error: { statusCode: 400, code: 'INVALID_REORDER', message: 'x' } }),
    );
    await waitFor(() => expect(ids(queryClient)).toEqual(['a', 'b', 'c']));
  });
});
