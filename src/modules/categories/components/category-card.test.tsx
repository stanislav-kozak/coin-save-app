import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { CategoriesGrid } from './categories-grid';
import { CategoryCard } from './category-card';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

const groceries = {
  id: 'c1',
  name: 'Продукти',
  icon: '🛒',
  color: '#F97350',
  monthlyLimit: '2000',
};

beforeEach(() => {
  get.mockReset(); // block body: a returned function would run as a teardown hook
});

describe('CategoryCard', () => {
  it('shows the over-limit badge outside the header so the name keeps its width', () => {
    renderWithProviders(
      <CategoryCard
        category={{ ...groceries, name: 'Комунальні платежі' }}
        spent="2400"
        pct={120}
        currency="UAH"
      />,
    );
    const badge = screen.getByText(/понад ліміт/).parentElement!;
    expect(badge.closest('header')).toBeNull();
    expect(badge).toHaveClass('absolute');
  });

  it('shows spent of limit with percentage', () => {
    renderWithProviders(<CategoryCard category={groceries} spent="1200" pct={60} currency="UAH" />);
    expect(screen.getByText(/1\s200,00\s₴ \/ 2\s000,00\s₴ · 60%/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Продукти' })).toHaveAttribute(
      'aria-valuenow',
      '60',
    );
  });

  it('flags an over-limit category with the exact excess', () => {
    renderWithProviders(
      <CategoryCard category={groceries} spent="2400.10" pct={120} currency="UAH" />,
    );
    expect(screen.getByText(/\+400,10\s₴/)).toBeInTheDocument();
    expect(screen.getByText('понад ліміт')).toBeInTheDocument();
  });

  it('never shows a negative excess when the rounded pct says 100', () => {
    renderWithProviders(
      <CategoryCard category={groceries} spent="1995" pct={100} currency="UAH" />,
    );
    expect(screen.queryByText('понад ліміт')).toBeNull();
    expect(screen.queryByText(/\+-/)).toBeNull();
  });

  it('shows no "+0,00" badge when spending exactly the limit', () => {
    renderWithProviders(
      <CategoryCard category={groceries} spent="2000" pct={100} currency="UAH" />,
    );
    expect(screen.queryByText('понад ліміт')).toBeNull();
  });

  it('shows only the spent amount without a limit', () => {
    renderWithProviders(
      <CategoryCard
        category={{ ...groceries, monthlyLimit: null }}
        spent="450"
        pct={0}
        currency="UAH"
      />,
    );
    expect(screen.getByText(/450,00\s₴ витрачено/)).toBeInTheDocument();
  });
});

describe('CategoriesGrid', () => {
  it('shows categories without spending this month as zero', async () => {
    get.mockImplementation(async (path: string) =>
      path.endsWith('/categories')
        ? {
            data: [
              { ...groceries, sortOrder: 1 },
              {
                id: 'c2',
                name: 'Розваги',
                icon: '🎬',
                color: '#EC4899',
                monthlyLimit: null,
                sortOrder: 2,
              },
            ],
          }
        : {
            data: {
              currency: 'UAH',
              byCategory: [{ categoryId: 'c1', spent: '100', limit: '2000', pct: 5 }],
            },
          },
    );
    renderWithProviders(<CategoriesGrid spaceId="sp1" />);
    expect(await screen.findByText(/0,00\s₴ витрачено/)).toBeInTheDocument();
    expect(screen.getAllByText('Розваги').length).toBeGreaterThan(0);
  });

  it('explains a failed load and retries instead of vanishing', async () => {
    let failed = false;
    get.mockImplementation(async (path: string) => {
      if (path.endsWith('/analytics') && !failed) {
        failed = true;
        return { error: { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x' } };
      }
      return path.endsWith('/categories')
        ? { data: [{ ...groceries, sortOrder: 1 }] }
        : { data: { currency: 'UAH', byCategory: [] } };
    });
    renderWithProviders(<CategoriesGrid spaceId="sp1" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Помилка сервера');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Спробувати ще раз' }));
    expect(await screen.findByRole('progressbar', { name: 'Продукти' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
