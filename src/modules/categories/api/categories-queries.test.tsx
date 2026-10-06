import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userTimeZone } from '@/shared/lib/periods';
import { useCategories, useMonthAnalytics } from './categories-queries';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useCategories', () => {
  it('returns categories in their saved order', async () => {
    get.mockResolvedValue({
      data: [
        { id: 'b', sortOrder: 2 },
        { id: 'a', sortOrder: 1 },
      ],
    });
    const { result } = renderHook(() => useCategories('sp1'), { wrapper });
    await waitFor(() => expect(result.current.data?.map((c) => c.id)).toEqual(['a', 'b']));
    expect(get).toHaveBeenCalledWith('/api/spaces/{spaceId}/categories', {
      params: { path: { spaceId: 'sp1' } },
    });
  });

  it("asks for this month in the user's timezone", async () => {
    get.mockResolvedValue({ data: { byCategory: [] } });
    renderHook(() => useMonthAnalytics('sp1', new Date(2026, 9, 6, 15, 30)), { wrapper });
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(get).toHaveBeenCalledWith('/api/spaces/{spaceId}/analytics', {
      params: {
        path: { spaceId: 'sp1' },
        query: { from: '2026-10-01', to: '2026-10-06', tz: userTimeZone() },
      },
    });
  });
});
