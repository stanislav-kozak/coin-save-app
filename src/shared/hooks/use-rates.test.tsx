import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { useRates } from './use-rate';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  get.mockReset();
});

it('collects today’s rates into the space currency and the ones that failed', async () => {
  get.mockImplementation(async (...args: unknown[]) => {
    const opts = args[1] as { params: { query: { from: string } } };
    return opts.params.query.from === 'EUR'
      ? { data: { from: 'EUR', to: 'UAH', rate: '45.1', date: '2026-10-09' } }
      : { error: { statusCode: 503, code: 'CURRENCY_API_UNAVAILABLE', message: 'x' } };
  });
  const { result } = renderHook(() => useRates(['EUR', 'USD'], 'UAH'), { wrapper });
  expect(result.current.pending).toBe(true);
  await waitFor(() => expect(result.current.pending).toBe(false));
  expect(result.current.rates.get('EUR')).toBe('45.1');
  expect(result.current.failed).toEqual(['USD']);
});
