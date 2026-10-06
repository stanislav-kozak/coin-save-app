import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateExpense } from './expenses-mutations';

const post = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { POST: (...a: unknown[]) => post(...a) } }));

const listKey = ['expenses', 'sp1', '2026-10-04'];

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(
    ['wallets', 'sp1'],
    [
      { id: 'w1', name: 'Mono', currency: 'UAH', balance: '100.00' },
      { id: 'w2', name: 'Cash', currency: 'USD', balance: '10' },
    ],
  );
  queryClient.setQueryData(listKey, []);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useCreateExpense('sp1'), { wrapper });
  return { queryClient, result };
}
const balance = (qc: QueryClient, id: string) =>
  qc.getQueryData<{ id: string; balance: string }[]>(['wallets', 'sp1'])!.find((w) => w.id === id)!
    .balance;

beforeEach(() => {
  post.mockReset();
});

describe('useCreateExpense', () => {
  it('lowers the wallet balance and lists the expense before the server answers', async () => {
    let resolve!: (v: unknown) => void;
    post.mockReturnValue(new Promise((r) => (resolve = r)));
    const { queryClient, result } = setup();
    act(() => result.current.mutate({ walletId: 'w2', categoryId: 'c1', amount: 12.5 }));
    await waitFor(() => expect(balance(queryClient, 'w2')).toBe('-2.50'));
    const list = queryClient.getQueryData<{ amount: string; walletCurrency: string }[]>(listKey)!;
    expect(list[0]).toMatchObject({ amount: '12.5', walletCurrency: 'USD' });
    resolve({ data: { id: 'e1' } });
  });

  it('rolls back exactly when the server refuses', async () => {
    post.mockResolvedValue({
      error: { statusCode: 400, code: 'INVALID_OCCURRED_AT', message: 'x' },
    });
    const { queryClient, result } = setup();
    await act(async () => {
      await result.current.mutateAsync({ walletId: 'w1', amount: 40 }).catch(() => {});
    });
    expect(balance(queryClient, 'w1')).toBe('100.00');
    expect(queryClient.getQueryData(listKey)).toEqual([]);
  });

  it('sends the wallet, category, amount, note and a current timestamp', async () => {
    post.mockResolvedValue({ data: { id: 'e1' } });
    const { result } = setup();
    const before = Date.now();
    await act(async () => {
      await result.current.mutateAsync({
        walletId: 'w1',
        categoryId: 'c1',
        amount: 340,
        note: 'АТБ',
      });
    });
    const body = post.mock.calls[0][1].body;
    expect(body).toMatchObject({
      walletId: 'w1',
      categoryId: 'c1',
      type: 'EXPENSE',
      amount: 340,
      note: 'АТБ',
    });
    expect(Date.parse(body.occurredAt)).toBeGreaterThanOrEqual(before);
  });
});
