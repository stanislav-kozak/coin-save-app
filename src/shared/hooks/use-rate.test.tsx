import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRate } from './use-rate';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: { from: 'UAH', to: 'USD', rate: '0.024134', date: '2026-10-08' } });
});

describe('useRate', () => {
  it("fetches today's rate for the pair", async () => {
    const { result } = renderHook(() => useRate('UAH', 'USD'), { wrapper });
    await waitFor(() => expect(result.current.data?.rate).toBe('0.024134'));
    expect(get).toHaveBeenCalledWith('/api/currencies/rate', {
      params: { query: { from: 'UAH', to: 'USD' } },
    });
  });

  it('asks nothing for the same currency', () => {
    const { result } = renderHook(() => useRate('UAH', 'UAH'), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(get).not.toHaveBeenCalled();
  });
});
