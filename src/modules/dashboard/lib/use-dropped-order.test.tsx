import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDroppedOrder } from './use-dropped-order';

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
  return renderHook(() => useDroppedOrder('sp1'), { wrapper }).result;
}

describe('useDroppedOrder', () => {
  it('shows the dropped order at once, then goes back and reports a refusal', async () => {
    let answer!: (v: unknown) => void;
    patch.mockReturnValue(new Promise((r) => (answer = r)));
    const result = setup();
    act(() => result.current.apply(['c', 'a', 'b']));
    expect(result.current.order).toEqual(['c', 'a', 'b']); // same render as the drop
    await act(async () =>
      answer({ error: { statusCode: 400, code: 'INVALID_REORDER', message: 'x' } }),
    );
    await waitFor(() => expect(result.current.order).toBeNull());
    expect(result.current.error).toMatchObject({ code: 'INVALID_REORDER' });
  });

  it('clears the order and has no error when the server accepts', async () => {
    patch.mockResolvedValue({ data: [] });
    const result = setup();
    await act(async () => result.current.apply(['b', 'a', 'c']));
    await waitFor(() => expect(result.current.order).toBeNull());
    expect(result.current.error).toBeNull();
  });
});
