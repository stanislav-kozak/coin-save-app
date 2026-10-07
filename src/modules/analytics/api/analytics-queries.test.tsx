import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { periodOf } from '../lib/period';
import { useAnalytics } from './analytics-queries';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

describe('useAnalytics', () => {
  it('keeps showing the previous period while the next one loads (no skeleton jump)', async () => {
    get
      .mockResolvedValueOnce({ data: { totalExpense: '425' } })
      .mockReturnValue(new Promise(() => {}));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const october = periodOf('month', new Date(2026, 9, 7));
    const { result, rerender } = renderHook(({ p }) => useAnalytics('s1', p, []), {
      wrapper,
      initialProps: { p: october },
    });
    await waitFor(() => expect(result.current.data).toEqual({ totalExpense: '425' }));
    rerender({ p: periodOf('month', new Date(2026, 8, 7)) });
    expect(result.current.data).toEqual({ totalExpense: '425' });
    expect(result.current.isPlaceholderData).toBe(true);
  });

  it("never shows another space's numbers while switching spaces", async () => {
    get.mockReset();
    get
      .mockResolvedValueOnce({ data: { totalExpense: '425' } })
      .mockReturnValue(new Promise(() => {}));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const october = periodOf('month', new Date(2026, 9, 7));
    const { result, rerender } = renderHook(({ s }) => useAnalytics(s, october, []), {
      wrapper,
      initialProps: { s: 's1' },
    });
    await waitFor(() => expect(result.current.data).toEqual({ totalExpense: '425' }));
    rerender({ s: 's2' });
    expect(result.current.data).toBeUndefined();
  });
});
