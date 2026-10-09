import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { AnalyticsPage } from './analytics-page';

let search = new URLSearchParams();
vi.mock('next/navigation', () => ({ useSearchParams: () => search }));
vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/s/s1/analytics',
  useRouter: () => ({ replace: vi.fn() }),
}));
const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

const analytics = {
  currency: 'UAH',
  period: { from: '2026-10-01', to: '2026-10-31' },
  timeZone: 'Europe/Kyiv',
  totalExpense: '425',
  totalIncome: '15000',
  previousPeriodExpense: '400',
  previousPeriodIncome: '15000',
  byCategory: [
    {
      categoryId: 'c1',
      name: 'Продукти',
      icon: '🛒',
      color: '#15bba3',
      spent: '340',
      currency: 'UAH' as const,
      spentInCurrency: '340',
      limit: '2000',
      pct: 17,
    },
    {
      categoryId: 'c2',
      name: 'Кафе',
      icon: '☕',
      color: '#ec4999',
      spent: '85',
      currency: 'UAH' as const,
      spentInCurrency: '85',
      limit: null,
      pct: 0,
    },
  ],
  byDay: [],
  expenses: [
    {
      id: 'e1',
      type: 'EXPENSE',
      amount: '340',
      walletCurrency: 'UAH',
      amountInPrimary: '340',
      fxRate: '1',
      note: 'АТБ',
      occurredAt: '2026-10-07T11:32:00Z',
      walletId: 'w1',
      walletName: 'Family Card',
      categoryId: 'c1',
      categoryName: 'Продукти',
      createdById: 'u1',
      createdByName: 'Я',
    },
    {
      id: 'e2',
      type: 'INCOME',
      amount: '15000',
      walletCurrency: 'UAH',
      amountInPrimary: '15000',
      fxRate: '1',
      note: null,
      occurredAt: '2026-10-06T06:00:00Z',
      walletId: 'w1',
      walletName: 'Family Card',
      categoryId: null,
      categoryName: '',
      createdById: 'u1',
      createdByName: 'Я',
    },
  ],
};

function serve(data: unknown = analytics) {
  get.mockImplementation(async (path: string, opts?: unknown) => {
    if (path.endsWith('/analytics')) {
      if (data === 'pending') return new Promise(() => {});
      const from = (opts as { params: { query: { from: string } } }).params.query.from;
      if (from === '2026-09-01')
        return { data: { ...analytics, totalExpense: '340', totalIncome: '0' } };
      if (data === 'error')
        return { error: { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x' } };
      return { data };
    }
    if (path.endsWith('.csv')) return { data: new Blob(['Date,Wallet\n']) };
    if (path.endsWith('/wallets'))
      return {
        data: [{ id: 'w1', name: 'Family Card', currency: 'UAH', balance: '0', archived: false }],
      };
    return {
      data: [
        {
          id: 'c1',
          name: 'Продукти',
          icon: '🛒',
          color: '#15bba3',
          monthlyLimit: '2000',
          sortOrder: 0,
          archived: false,
        },
      ],
    };
  });
}

beforeEach(() => {
  search = new URLSearchParams();
  get.mockReset();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 7, 15));
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('AnalyticsPage', () => {
  it('shows totals, the split, limits and the period list for a month', async () => {
    serve();
    renderWithProviders(<AnalyticsPage spaceId="s1" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Аналітика' })).toBeInTheDocument();
    expect(await screen.findByText('Продукти — 80%')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Ліміти категорій' })).toBeInTheDocument();
    const list = screen
      .getByRole('heading', { level: 2, name: 'Витрати за період' })
      .closest('section')!;
    expect(within(list).getByText('Сьогодні')).toBeInTheDocument();
    expect(within(list).getAllByText('Family Card').length).toBeGreaterThan(0);
    expect(within(list).getByText('Дохід')).toBeInTheDocument();
  });

  it('hides limits outside month periods', async () => {
    search = new URLSearchParams('period=week&from=2026-10-05');
    serve();
    renderWithProviders(<AnalyticsPage spaceId="s1" />);
    await screen.findByText('Продукти — 80%');
    expect(screen.queryByRole('heading', { level: 2, name: 'Ліміти категорій' })).toBeNull();
  });

  it('has an empty state, a skeleton and a retry', async () => {
    serve({ ...analytics, totalExpense: '0', totalIncome: '0', byCategory: [], expenses: [] });
    const empty = renderWithProviders(<AnalyticsPage spaceId="s1" />);
    expect(await screen.findByText('За цей період записів немає')).toBeInTheDocument();
    empty.unmount();
    serve('pending');
    const loading = renderWithProviders(<AnalyticsPage spaceId="s1" />);
    expect(screen.getByText('Завантаження…').closest('[aria-busy="true"]')).not.toBeNull();
    loading.unmount();
    serve('error');
    renderWithProviders(<AnalyticsPage spaceId="s1" />);
    expect(await screen.findByRole('button', { name: 'Спробувати ще раз' })).toBeInTheDocument();
  });

  it('downloads the period as CSV', async () => {
    serve();
    const created = vi.fn(() => 'blob:x');
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL: created, revokeObjectURL: vi.fn() }),
    );
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    renderWithProviders(<AnalyticsPage spaceId="s1" />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Експорт CSV/ }));
    await vi.waitFor(() => expect(click).toHaveBeenCalled());
    expect(get).toHaveBeenCalledWith('/api/spaces/{spaceId}/expenses.csv', {
      params: {
        path: { spaceId: 's1' },
        query: { from: '2026-10-01', to: '2026-10-31', tz: expect.any(String) },
      },
      parseAs: 'blob',
    });
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe(
      'coinsave-2026-10-01-2026-10-31.csv',
    );
    // Revoking right away cancels the download in Safari/iOS, so it happens a moment later.
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x'), {
      timeout: 3000,
    });
  });

  it('says when the export failed', async () => {
    serve();
    get.mockImplementation(async (path: string) =>
      path.endsWith('.csv')
        ? { error: { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x' } }
        : { data: path.endsWith('/analytics') ? analytics : [] },
    );
    renderWithProviders(<AnalyticsPage spaceId="s1" />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Експорт CSV/ }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('compares with the real previous calendar period', async () => {
    serve();
    renderWithProviders(<AnalyticsPage spaceId="s1" />);
    // 425 now vs 340 in September (not the server's "same number of days before")
    expect(await screen.findByText('+25%')).toBeInTheDocument();
    const queried = get.mock.calls
      .filter((c) => c[0].endsWith('/analytics'))
      .map((c) => c[1].params.query.from);
    expect(queried).toEqual(expect.arrayContaining(['2026-10-01', '2026-09-01']));
  });

  it('lists limits only for categories with spending or a limit', async () => {
    serve({
      ...analytics,
      byCategory: [
        ...analytics.byCategory,
        {
          categoryId: 'c3',
          name: 'Старе',
          icon: '🧾',
          color: null,
          spent: '0',
          currency: 'UAH' as const,
          spentInCurrency: '0',
          limit: null,
          pct: 0,
        },
      ],
    });
    renderWithProviders(<AnalyticsPage spaceId="s1" />);
    const limits = (
      await screen.findByRole('heading', { level: 2, name: 'Ліміти категорій' })
    ).closest('section')!;
    expect(within(limits).getByText('Продукти')).toBeInTheDocument();
    expect(within(limits).queryByText('Старе')).toBeNull();
  });
});
