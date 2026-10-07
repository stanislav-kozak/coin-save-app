import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { RecurringPage } from './recurring-page';

const api = { GET: vi.fn(), POST: vi.fn(), PATCH: vi.fn(), DELETE: vi.fn() };
vi.mock('@/shared/lib/api-client', () => ({
  api: {
    GET: (...a: unknown[]) => api.GET(...a),
    POST: (...a: unknown[]) => api.POST(...a),
    PATCH: (...a: unknown[]) => api.PATCH(...a),
    DELETE: (...a: unknown[]) => api.DELETE(...a),
  },
}));

const rule = (over: Record<string, unknown>) => ({
  id: 'r1',
  spaceId: 's1',
  walletId: 'w1',
  categoryId: 'c1',
  type: 'EXPENSE',
  amount: '249',
  currency: 'UAH',
  name: 'Netflix',
  note: null,
  frequency: 'MONTHLY',
  dayOfMonth: 15,
  startDate: '2026-10-15T00:00:00.000Z',
  endDate: null,
  lastGeneratedAt: null,
  active: true,
  ...over,
});
const rules = [
  rule({}),
  rule({ id: 'r2', name: 'Spotify', amount: '199.5', dayOfMonth: 5 }),
  rule({ id: 'r3', name: 'Спортзал', amount: '1000', active: false }),
  rule({
    id: 'r4',
    name: 'Зарплата',
    type: 'INCOME',
    amount: '35000',
    categoryId: null,
    dayOfMonth: 1,
  }),
];

function serve(list: unknown[] | 'pending' | 'error' = rules) {
  api.GET.mockImplementation(async (path: string) => {
    if (path.endsWith('/recurring')) {
      if (list === 'pending') return new Promise(() => {});
      if (list === 'error')
        return { error: { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x' } };
      return { data: list };
    }
    if (path.endsWith('/wallets'))
      return {
        data: [
          {
            id: 'w1',
            name: 'Mono',
            currency: 'UAH',
            balance: '0',
            color: '#3b82f6',
            archived: false,
          },
        ],
      };
    return {
      data: [
        {
          id: 'c1',
          name: 'Підписки',
          icon: '📺',
          color: '#ec4999',
          monthlyLimit: null,
          sortOrder: 0,
          archived: false,
        },
      ],
    };
  });
}

beforeEach(() => {
  for (const m of Object.values(api)) m.mockReset();
  api.PATCH.mockResolvedValue({ data: {} });
  api.DELETE.mockResolvedValue({});
});

const section = (name: string) =>
  screen.getByRole('heading', { level: 2, name }).closest('section')!;

describe('RecurringPage', () => {
  it('groups expenses and incomes with captions, signed amounts and monthly totals', async () => {
    serve();
    renderWithProviders(<RecurringPage spaceId="s1" />);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Регулярні платежі' }),
    ).toBeInTheDocument();
    await screen.findByText('Netflix');
    const expenses = section('Витрати');
    expect(within(expenses).getByText('Netflix')).toBeInTheDocument();
    expect(within(expenses).getAllByText('щомісяця, 15-го').length).toBeGreaterThan(0);
    // rendered twice: under the name on phones, on the right on desktop
    expect(within(expenses).getAllByText(/-249,00\s₴/)).toHaveLength(2);
    // paused «Спортзал» is excluded from the total
    expect(within(expenses).getByText(/Разом: 448,50\s₴\/міс/)).toBeInTheDocument();
    const incomes = section('Доходи');
    for (const el of within(incomes).getAllByText(/\+35\s000,00\s₴/))
      expect(el).toHaveClass('text-success');
  });

  it('pauses and resumes a rule', async () => {
    serve();
    renderWithProviders(<RecurringPage spaceId="s1" />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Призупинити: Netflix' }));
    expect(api.PATCH).toHaveBeenCalledWith('/api/spaces/{spaceId}/recurring/{recurringId}/pause', {
      params: { path: { spaceId: 's1', recurringId: 'r1' } },
    });
    expect(screen.getByText('На паузі')).toBeInTheDocument(); // «Спортзал»
    await user.click(screen.getByRole('button', { name: 'Відновити: Спортзал' }));
    expect(api.PATCH).toHaveBeenCalledWith('/api/spaces/{spaceId}/recurring/{recurringId}/resume', {
      params: { path: { spaceId: 's1', recurringId: 'r3' } },
    });
  });

  it('deletes only after confirming, and says why it failed', async () => {
    serve();
    api.DELETE.mockResolvedValue({
      error: { statusCode: 404, code: 'RECURRING_NOT_FOUND', message: 'x' },
    });
    renderWithProviders(<RecurringPage spaceId="s1" />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Видалити: Netflix' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent(/уже записані залишаться/);
    expect(api.DELETE).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Видалити' }));
    expect(await within(dialog).findByRole('alert')).toBeInTheDocument();
  });

  it('says why pausing failed', async () => {
    serve();
    api.PATCH.mockResolvedValue({
      error: { statusCode: 404, code: 'RECURRING_NOT_FOUND', message: 'x' },
    });
    renderWithProviders(<RecurringPage spaceId="s1" />);
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'Призупинити: Netflix' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('shows an empty state, a skeleton and an error with retry', async () => {
    serve([]);
    const empty = renderWithProviders(<RecurringPage spaceId="s1" />);
    expect(await screen.findByText('Ще немає регулярних платежів')).toBeInTheDocument();
    empty.unmount();
    serve('pending');
    const loading = renderWithProviders(<RecurringPage spaceId="s1" />);
    expect(screen.getByText('Завантаження…').closest('[aria-busy="true"]')).not.toBeNull();
    loading.unmount();
    serve('error');
    renderWithProviders(<RecurringPage spaceId="s1" />);
    expect(await screen.findByRole('button', { name: 'Спробувати ще раз' })).toBeInTheDocument();
  });
});
