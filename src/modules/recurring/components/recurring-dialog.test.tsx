import { screen, within } from '@testing-library/react';
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
beforeEach(() => {
  notify.mockReset();
});

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
  lastGeneratedAt: null as string | null,
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

/** Opens the date field and picks a day of the shown month. */
async function pickDay(
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp,
  day: string,
  months = 0,
) {
  await user.click(screen.getByRole('button', { name: label }));
  for (let i = 0; i < months; i++)
    await user.click(await screen.findByRole('button', { name: 'Наступний місяць' }));
  const grid = await screen.findByRole('grid');
  await user.click(within(grid).getByText(day, { selector: 'button' }));
}

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
    // The calendar opens on the default first payment (7 November); pick the 15th.
    await pickDay(user, /Перший платіж/, '15');
    expect(screen.getByRole('button', { name: /Перший платіж/ })).toHaveTextContent(
      '15 листопада 2026',
    );
    expect(screen.getByText('Далі щомісяця 15-го числа')).toBeInTheDocument();
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
          startDate: '2026-11-15',
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

  it('moves the payment day of an existing rule with the calendar', async () => {
    renderDialog(netflix);
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    const field = screen.getByRole('button', { name: /Наступний платіж/ });
    expect(field).toHaveTextContent('15 жовтня 2026');
    await pickDay(user, /Наступний платіж/, '20');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(api.PATCH).toHaveBeenCalled());
    expect(api.PATCH.mock.calls[0][1].body).toEqual({ dayOfMonth: 20 });
  });

  it('shows the picked date as the next payment, a month ahead too', async () => {
    renderDialog(netflix);
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    await pickDay(user, /Наступний платіж/, '10', 1);
    expect(screen.getByRole('button', { name: /Наступний платіж/ })).toHaveTextContent(
      '10 листопада 2026',
    );
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(api.PATCH).toHaveBeenCalled());
    expect(api.PATCH.mock.calls[0][1].body).toEqual({ dayOfMonth: 10 });
  });

  it('offers only the dates the next payment can fall on', async () => {
    renderDialog({
      ...netflix,
      dayOfMonth: 5,
      startDate: '2026-09-05T00:00:00.000Z',
      lastGeneratedAt: '2026-10-05T00:00:00.000Z',
    });
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    const field = screen.getByRole('button', { name: /Наступний платіж/ });
    expect(field).toHaveTextContent('5 листопада 2026');
    await user.click(field);
    const grid = await screen.findByRole('grid');
    expect(screen.getByText(/листопад 2026/i)).toBeInTheDocument();
    expect(within(grid).getByText('30', { selector: 'button' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Попередній місяць' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Наступний місяць' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('does not offer an end date for now, when creating or editing', async () => {
    const { unmount } = renderDialog();
    await screen.findByRole('option', { name: /Cash/ });
    expect(screen.queryByLabelText('Діє до')).toBeNull();
    unmount();
    renderDialog(netflix);
    await screen.findByRole('option', { name: /Cash/ });
    expect(screen.queryByLabelText('Діє до')).toBeNull();
  });

  // The end date is hidden for now (SHOW_END_DATE); these come back with it.
  it.skip('clears the end date with null', async () => {
    renderDialog(netflix);
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    await user.clear(screen.getByLabelText('Діє до'));
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(api.PATCH).toHaveBeenCalled());
    expect(api.PATCH.mock.calls[0][1].body).toEqual({ endDate: null });
  });

  it.skip('refuses an end date before the first payment', async () => {
    renderDialog();
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    await user.type(screen.getByLabelText('Назва'), 'Netflix');
    await user.type(screen.getByLabelText('Сума'), '249');
    await pickDay(user, /Перший платіж/, '15');
    await user.type(screen.getByLabelText('Діє до'), '2026-11-10');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    expect(
      await screen.findByText('Завершення має бути після першого платежу'),
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
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Цей гаманець в архіві — відновіть його в налаштуваннях',
    );
    expect(notify).not.toHaveBeenCalled();
  });

  it('explains short months for days 29–31', async () => {
    renderDialog();
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    await pickDay(user, /Перший платіж/, '31', 1); // December
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
