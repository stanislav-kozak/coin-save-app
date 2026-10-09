import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { MonthCard } from './month-card';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: { GET: (...a: unknown[]) => get(...a), POST: vi.fn(), PATCH: vi.fn(), DELETE: vi.fn() },
}));

type Cat = { id: string; name: string; monthlyLimit: string | null; currency: string | null };
function serve(categories: Cat[], { eurRate = '45' as string | null } = {}) {
  get.mockImplementation(async (path: string) => {
    if (path.endsWith('/analytics'))
      return {
        data: {
          currency: 'UAH',
          totalExpense: '12450',
          totalIncome: '31000',
          byCategory: [],
          expenses: [],
        },
      };
    if (path.endsWith('/categories'))
      return {
        data: categories.map((c, i) => ({
          icon: '☕',
          color: null,
          sortOrder: i,
          archived: false,
          ...c,
        })),
      };
    if (path === '/api/currencies/rate')
      return eurRate
        ? { data: { from: 'EUR', to: 'UAH', rate: eurRate, date: '2026-10-07' } }
        : { error: { statusCode: 503, code: 'CURRENCY_API_UNAVAILABLE', message: 'x' } };
    return { data: [] };
  });
}

beforeEach(() => {
  get.mockReset();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 7, 12));
});
afterEach(() => {
  vi.useRealTimers();
});

describe('MonthCard', () => {
  it('shows the month at a glance: spent, of the limits, income, balance and days left', async () => {
    serve([{ id: 'c1', name: 'Продукти', monthlyLimit: '20000', currency: null }]);
    renderWithProviders(<MonthCard spaceId="s1" />);
    expect(await screen.findByText('Жовтень · витрачено')).toBeInTheDocument();
    expect(screen.getAllByText(/12\s450,00\s₴/).length).toBeGreaterThan(0);
    expect(await screen.findByText(/з 20\s000,00\s₴ лімітів/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '62');
    expect(screen.getAllByText(/31\s000,00\s₴/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\+18\s550,00\s₴/).length).toBeGreaterThan(0);
    const days = screen.getByText('Залишилось днів').parentElement!;
    expect(days).toHaveTextContent('25'); // 31 − 7 + 1
    expect(days).toHaveClass('hidden', 'md:block');
  });

  it("adds a limit in another currency at today's rate, marked approximate", async () => {
    serve([
      { id: 'c1', name: 'Продукти', monthlyLimit: '3000', currency: null },
      { id: 'c2', name: 'Подорож', monthlyLimit: '50', currency: 'EUR' },
    ]);
    renderWithProviders(<MonthCard spaceId="s1" />);
    expect(await screen.findByText(/з ≈ 5\s250,00\s₴ лімітів/)).toBeInTheDocument();
  });

  it('says which limits it could not count when a rate is unavailable', async () => {
    serve(
      [
        { id: 'c1', name: 'Продукти', monthlyLimit: '3000', currency: null },
        { id: 'c2', name: 'Подорож', monthlyLimit: '50', currency: 'EUR' },
      ],
      { eurRate: null },
    );
    renderWithProviders(<MonthCard spaceId="s1" />);
    expect(await screen.findByText(/Частину лімітів не враховано/)).toBeInTheDocument();
  });

  it('offers to set a limit when there are none', async () => {
    serve([{ id: 'c1', name: 'Продукти', monthlyLimit: null, currency: null }]);
    renderWithProviders(<MonthCard spaceId="s1" />);
    expect(await screen.findByText('Ліміти не задано')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).toBeNull();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Задати' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
