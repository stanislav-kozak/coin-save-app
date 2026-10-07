import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useDeleteRecurring,
  usePauseRecurring,
  useResumeRecurring,
  useUpdateRecurring,
} from './recurring-mutations';
import { useRecurring } from './recurring-queries';

const api = { GET: vi.fn(), PATCH: vi.fn(), DELETE: vi.fn() };
vi.mock('@/shared/lib/api-client', () => ({
  api: {
    GET: (...a: unknown[]) => api.GET(...a),
    PATCH: (...a: unknown[]) => api.PATCH(...a),
    DELETE: (...a: unknown[]) => api.DELETE(...a),
  },
}));

beforeEach(() => {
  for (const m of Object.values(api)) {
    m.mockReset();
    m.mockResolvedValue({ data: [] });
  }
});

function setup<T>(hook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(hook, { wrapper });
  return { result, keys: () => invalidate.mock.calls.map((c) => c[0]?.queryKey) };
}
const path = (extra = {}) => ({ params: { path: { spaceId: 's1', ...extra } } });

describe('recurring API hooks', () => {
  it('lists paused rules too, so they can be resumed', async () => {
    const { result } = setup(() => useRecurring('s1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.GET).toHaveBeenCalledWith('/api/spaces/{spaceId}/recurring', {
      params: { path: { spaceId: 's1' }, query: { includeInactive: true } },
    });
  });

  it('updates, pauses, resumes and deletes, refreshing the list', async () => {
    const update = setup(() => useUpdateRecurring('s1'));
    await act(() => update.result.current.mutateAsync({ id: 'r1', body: { amount: 299 } }));
    expect(api.PATCH).toHaveBeenCalledWith('/api/spaces/{spaceId}/recurring/{recurringId}', {
      ...path({ recurringId: 'r1' }),
      body: { amount: 299 },
    });
    expect(update.keys()).toContainEqual(['recurring', 's1']);

    const pause = setup(() => usePauseRecurring('s1'));
    await act(() => pause.result.current.mutateAsync('r1'));
    expect(api.PATCH).toHaveBeenCalledWith(
      '/api/spaces/{spaceId}/recurring/{recurringId}/pause',
      path({ recurringId: 'r1' }),
    );
    const resume = setup(() => useResumeRecurring('s1'));
    await act(() => resume.result.current.mutateAsync('r1'));
    expect(api.PATCH).toHaveBeenCalledWith(
      '/api/spaces/{spaceId}/recurring/{recurringId}/resume',
      path({ recurringId: 'r1' }),
    );
    const del = setup(() => useDeleteRecurring('s1'));
    await act(() => del.result.current.mutateAsync('r1'));
    expect(api.DELETE).toHaveBeenCalledWith(
      '/api/spaces/{spaceId}/recurring/{recurringId}',
      path({ recurringId: 'r1' }),
    );
    expect(del.keys()).toContainEqual(['recurring', 's1']);
  });
});
