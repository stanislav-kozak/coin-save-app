import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { RecurringDialog } from './recurring-dialog';

const api = { GET: vi.fn(), POST: vi.fn(), PATCH: vi.fn() };
vi.mock('@/shared/lib/api-client', () => ({
  api: {
    GET: (...a: unknown[]) => api.GET(...a),
    POST: (...a: unknown[]) => api.POST(...a),
    PATCH: (...a: unknown[]) => api.PATCH(...a),
  },
}));
const notify = vi.fn();
vi.mock('@/shared/ui/toaster', () => ({ notify: (...a: unknown[]) => notify(...a) }));
beforeEach(() => notify.mockReset());

const netflix = {
  id: 'r1',
  walletId: 'w1',
  categoryId: 'c1',
  type: 'EXPENSE' as const,
  amount: '249',
  currency: 'UAH',
  name: 'Netflix',
  note: null as string | null,
  dayOfMonth: 15,
  startDate: '2026-10-15T00:00:00.000Z',
  endDate: '2027-01-01T00:00:00.000Z',
  active: true,
};

beforeEach(() => {
  for (const m of Object.values(api)) m.mockReset();
  api.GET.mockImplementation(async (path: string) =>
    path.endsWith('/wallets')
      ? {
          data: [
            { id: 'w1', name: 'Mono', currency: 'UAH', balance: '0', archived: false },
            { id: 'w2', name: 'Cash', currency: 'USD', balance: '0', archived: false },
          ],
        }
      : {
          data: [
            { id: 'c1', name: 'Підписки', icon: '📺', color: null, sortOrder: 0, archived: false },
          ],
        },
  );
  api.POST.mockResolvedValue({ data: { id: 'r9' } });
  api.PATCH.mockResolvedValue({ data: netflix });
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 7, 12));
});
afterEach(() => {
  vi.useRealTimers();
});

const renderDialog = (rule?: typeof netflix) =>
  renderWithProviders(<RecurringDialog spaceId="s1" rule={rule} open onOpenChange={vi.fn()} />);

describe('RecurringDialog', () => {
  it('creates an expense whose first payment is the next occurrence', async () => {
    renderDialog();
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    await user.type(screen.getByLabelText('Назва'), 'Netflix');
    await user.type(screen.getByLabelText('Сума'), '249');
    await user.selectOptions(screen.getByLabelText('Категорія'), 'c1');
    await user.selectOptions(screen.getByLabelText('День місяця'), '15');
    expect(screen.getByText(/Перший платіж: 15 жовтня/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(api.POST).toHaveBeenCalled());
    expect(api.POST.mock.calls[0]).toEqual([
      '/api/spaces/{spaceId}/recurring',
      {
        params: { path: { spaceId: 's1' } },
        body: {
          type: 'EXPENSE',
          name: 'Netflix',
          amount: 249,
          walletId: 'w1',
          categoryId: 'c1',
          frequency: 'MONTHLY',
          dayOfMonth: 15,
          startDate: '2026-10-15',
        },
      },
    ]);
    await vi.waitFor(() => expect(notify).toHaveBeenCalledWith('Регулярний платіж збережено'));
  });

  it('has no category for an income', async () => {
    renderDialog();
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    await user.click(screen.getByRole('radio', { name: 'Дохід' }));
    expect(screen.queryByLabelText('Категорія')).toBeNull();
    await user.type(screen.getByLabelText('Назва'), 'Зарплата');
    await user.type(screen.getByLabelText('Сума'), '35000');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(api.POST).toHaveBeenCalled());
    expect(api.POST.mock.calls[0][1].body).toMatchObject({ type: 'INCOME' });
    expect(api.POST.mock.calls[0][1].body).not.toHaveProperty('categoryId');
  });

  it('edits only what changed and never the type or start', async () => {
    renderDialog(netflix);
    const user = userEvent.setup();
    expect(screen.queryByRole('radio', { name: 'Дохід' })).toBeNull();
    await screen.findByRole('option', { name: /Cash/ });
    await user.clear(screen.getByLabelText('Сума'));
    await user.type(screen.getByLabelText('Сума'), '299');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(api.PATCH).toHaveBeenCalled());
    expect(api.PATCH.mock.calls[0][1].body).toEqual({ amount: 299 });
  });

  it('clears the end date with null', async () => {
    renderDialog(netflix);
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    await user.clear(screen.getByLabelText('Діє до'));
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(api.PATCH).toHaveBeenCalled());
    expect(api.PATCH.mock.calls[0][1].body).toEqual({ endDate: null });
  });

  it('refuses an end date before the first payment', async () => {
    renderDialog();
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    await user.type(screen.getByLabelText('Назва'), 'Netflix');
    await user.type(screen.getByLabelText('Сума'), '249');
    await user.selectOptions(screen.getByLabelText('День місяця'), '15');
    await user.type(screen.getByLabelText('Діє до'), '2026-10-10');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    expect(
      await screen.findByText('Дата завершення має бути після першого платежу'),
    ).toBeInTheDocument();
    expect(api.POST).not.toHaveBeenCalled();
  });

  it('shows a server refusal in the dialog', async () => {
    api.PATCH.mockResolvedValue({
      error: { statusCode: 400, code: 'WALLET_ARCHIVED', message: 'x' },
    });
    renderDialog(netflix);
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    await user.type(screen.getByLabelText('Назва'), ' HD');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Гаманець в архіві');
    expect(notify).not.toHaveBeenCalled();
  });

  it('explains short months for days 29–31', async () => {
    renderDialog();
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    await user.selectOptions(screen.getByLabelText('День місяця'), '31');
    expect(screen.getByText('У коротші місяці — останнього дня')).toBeInTheDocument();
  });

  it("shows the rule's own wallet and category, even archived, once the lists load", async () => {
    api.GET.mockImplementation(async (path: string) =>
      path.endsWith('/wallets')
        ? {
            data: [
              { id: 'w1', name: 'Mono', currency: 'UAH', balance: '0', archived: false },
              { id: 'w2', name: 'Cash', currency: 'USD', balance: '0', archived: true },
            ],
          }
        : {
            data: [
              {
                id: 'c1',
                name: 'Підписки',
                icon: '📺',
                color: null,
                sortOrder: 0,
                archived: false,
              },
              { id: 'c2', name: 'Старе', icon: '🧾', color: null, sortOrder: 1, archived: true },
            ],
          },
    );
    renderDialog({ ...netflix, walletId: 'w2', categoryId: 'c2' });
    expect(await screen.findByLabelText('Гаманець')).toHaveValue('w2');
    expect(screen.getByLabelText('Категорія')).toHaveValue('c2');
    expect(screen.getByRole('option', { name: /Старе/ })).toHaveTextContent('(архів)');
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('removes a note when it is cleared', async () => {
    renderDialog({ ...netflix, note: 'сімейний план' });
    const user = userEvent.setup();
    await user.clear(await screen.findByLabelText('Нотатка'));
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(api.PATCH).toHaveBeenCalled());
    expect(api.PATCH.mock.calls[0][1].body).toEqual({ note: '' });
  });
});
