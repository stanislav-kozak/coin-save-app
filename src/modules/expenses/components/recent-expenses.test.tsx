import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { RecentExpenses } from './recent-expenses';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

beforeEach(() => {
  get.mockReset();
});

const now = () => new Date().toISOString();

describe('RecentExpenses', () => {
  it('renders category, note, signed amount in wallet currency and time; tolerates missing refs', async () => {
    get.mockImplementation(async (path: string) => {
      if (path.endsWith('/categories'))
        return {
          data: [{ id: 'c1', name: 'Продукти', icon: '🛒', color: '#F97350', sortOrder: 1 }],
        };
      return {
        data: [
          {
            id: 'e1',
            type: 'EXPENSE',
            amount: '340',
            walletCurrency: 'UAH',
            walletId: 'w1',
            categoryId: 'c1',
            note: 'АТБ',
            occurredAt: now(),
          },
          {
            id: 'e2',
            type: 'INCOME',
            amount: '15000',
            walletCurrency: 'UAH',
            walletId: 'w1',
            categoryId: null,
            note: null,
            occurredAt: now(),
          },
          {
            id: 'e3',
            type: 'EXPENSE',
            amount: '5',
            walletCurrency: 'USD',
            walletId: 'archived',
            categoryId: 'deleted',
            note: null,
            occurredAt: now(),
          },
        ],
      };
    });
    renderWithProviders(<RecentExpenses spaceId="sp1" />);
    expect(await screen.findByText('Продукти')).toBeInTheDocument();
    expect(screen.getByText('АТБ')).toBeInTheDocument();
    expect(screen.getByText(/-340,00\s₴/)).toBeInTheDocument();
    expect(screen.getByText(/\+15\s000,00\s₴/)).toHaveClass('text-success');
    expect(screen.getByText(/-5,00\s(USD|\$)/)).toBeInTheDocument();
    expect(screen.getAllByText('Без категорії')).toHaveLength(1);
    expect(screen.getByText('Дохід')).toBeInTheDocument(); // uncategorized income
    expect(screen.getByText('Сьогодні')).toBeInTheDocument();
  });

  it('names expenses in an archived category', async () => {
    get.mockImplementation(
      async (path: string, init?: { params?: { query?: Record<string, unknown> } }) => {
        if (path.endsWith('/categories')) {
          const archived = {
            id: 'c9',
            name: 'Кафе',
            icon: '☕',
            color: '#A855F7',
            sortOrder: 4,
            archived: true,
          };
          return { data: init?.params?.query?.includeArchived ? [archived] : [] };
        }
        return {
          data: [
            {
              id: 'e1',
              type: 'EXPENSE',
              amount: '120',
              walletCurrency: 'UAH',
              walletId: 'w1',
              categoryId: 'c9',
              note: null,
              occurredAt: now(),
            },
          ],
        };
      },
    );
    renderWithProviders(<RecentExpenses spaceId="sp1" />);
    expect(await screen.findByText('Кафе')).toBeInTheDocument();
    expect(screen.queryByText('Без категорії')).toBeNull();
  });

  it('says so when there is nothing recent', async () => {
    get.mockResolvedValue({ data: [] });
    renderWithProviders(<RecentExpenses spaceId="sp1" />);
    expect(await screen.findByText('Витрат поки немає')).toBeInTheDocument();
  });

  it('shows a skeleton while recent expenses load', () => {
    get.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<RecentExpenses spaceId="sp1" />);
    const region = screen.getByText('Завантаження…').closest('[aria-busy="true"]')!;
    expect(region.querySelectorAll('[data-skeleton="row"]')).toHaveLength(4);
  });

  it('opens a record for editing', async () => {
    get.mockResolvedValue({
      data: [
        {
          id: 'e9',
          type: 'EXPENSE',
          amount: '5',
          walletId: 'w1',
          walletCurrency: 'UAH',
          categoryId: null,
          note: null,
          occurredAt: new Date().toISOString(),
        },
      ],
    });
    renderWithProviders(<RecentExpenses spaceId="sp1" />);
    const { default: userEvent } = await import('@testing-library/user-event');
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: /Редагувати.*Без категорії/ }));
    expect(await screen.findByRole('dialog', { name: 'Редагувати запис' })).toBeInTheDocument();
  });

  it('slides in an expense that arrives after the list was shown, not the first rows', async () => {
    const row = (id: string, amount: string) => ({
      id,
      type: 'EXPENSE',
      amount,
      walletCurrency: 'UAH',
      walletId: 'w1',
      categoryId: null,
      note: null,
      occurredAt: now(),
    });
    get.mockImplementation(async (path: string) =>
      path.endsWith('/categories') ? { data: [] } : { data: [row('e1', '10')] },
    );
    const { queryClient, container } = renderWithProviders(<RecentExpenses spaceId="s1" />);
    await screen.findByText(/-10,00/);
    expect(container.querySelector('li.motion-safe\\:animate-row-in')).toBeNull();
    get.mockImplementation(async (path: string) =>
      path.endsWith('/categories') ? { data: [] } : { data: [row('e2', '20'), row('e1', '10')] },
    );
    await queryClient.invalidateQueries({ queryKey: ['expenses', 's1'] });
    await screen.findByText(/-20,00/);
    const animated = container.querySelectorAll('li.motion-safe\\:animate-row-in');
    expect(animated).toHaveLength(1);
    expect(animated[0]).toHaveTextContent(/-20,00/);
  });
});
