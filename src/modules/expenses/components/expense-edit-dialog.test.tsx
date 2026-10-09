import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import uk from '@/shared/i18n/messages/uk.json';
import { ExpenseEditDialog } from './expense-edit-dialog';

const api = { GET: vi.fn(), PATCH: vi.fn(), DELETE: vi.fn() };
vi.mock('@/shared/lib/api-client', () => ({
  api: {
    GET: (...a: unknown[]) => api.GET(...a),
    PATCH: (...a: unknown[]) => api.PATCH(...a),
    DELETE: (...a: unknown[]) => api.DELETE(...a),
  },
}));
const notify = vi.fn();
vi.mock('@/shared/ui/toaster', () => ({ notify: (...a: unknown[]) => notify(...a) }));
beforeEach(() => notify.mockReset());

const expense = {
  id: 'e1',
  type: 'EXPENSE' as const,
  amount: '340',
  walletId: 'w1',
  walletCurrency: 'UAH',
  categoryId: 'c1',
  note: 'АТБ' as string | null,
  occurredAt: '2026-10-07T08:32:00.000Z',
};

let invalidate: { mock: { calls: { queryKey?: unknown }[][] } };
function renderDialog(onOpenChange = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  invalidate = vi.spyOn(queryClient, 'invalidateQueries') as unknown as typeof invalidate;
  render(
    <NextIntlClientProvider locale="uk" messages={uk} timeZone="Europe/Kyiv">
      <QueryClientProvider client={queryClient}>
        <ExpenseEditDialog spaceId="s1" expense={expense} open onOpenChange={onOpenChange} />
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
  return onOpenChange;
}

beforeEach(() => {
  for (const m of Object.values(api)) m.mockReset();
  api.GET.mockImplementation(async (path: string) =>
    path.endsWith('/wallets')
      ? { data: [{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '0', archived: false }] }
      : {
          data: [
            { id: 'c1', name: 'Продукти', icon: '🛒', color: null, sortOrder: 0, archived: false },
          ],
        },
  );
  api.PATCH.mockResolvedValue({ data: expense });
  api.DELETE.mockResolvedValue({});
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 7, 15));
});
afterEach(() => {
  vi.useRealTimers();
});

describe('ExpenseEditDialog', () => {
  it('saves only the changed amount and refreshes balances, lists and analytics', async () => {
    const onOpenChange = renderDialog();
    const user = userEvent.setup();
    const amount = await screen.findByLabelText('Сума');
    expect(screen.getByLabelText('Дата й час')).toHaveValue('2026-10-07T11:32');
    await user.clear(amount);
    await user.type(amount, '299');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(api.PATCH).toHaveBeenCalledWith('/api/spaces/{spaceId}/expenses/{expenseId}', {
      params: { path: { spaceId: 's1', expenseId: 'e1' } },
      body: { amount: 299 },
    });
    const keys = invalidate.mock.calls.map((c) => c[0]?.queryKey);
    expect(keys).toEqual(
      expect.arrayContaining([
        ['wallets', 's1'],
        ['expenses', 's1'],
        ['analytics', 's1'],
      ]),
    );
    expect(notify).toHaveBeenCalledWith('Збережено');
  });

  it('can make an expense uncategorized and remove its note', async () => {
    const onOpenChange = renderDialog();
    const user = userEvent.setup();
    await user.selectOptions(await screen.findByLabelText('Категорія'), 'Без категорії');
    await user.clear(screen.getByLabelText('Нотатка'));
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(api.PATCH).toHaveBeenCalledWith('/api/spaces/{spaceId}/expenses/{expenseId}', {
      params: { path: { spaceId: 's1', expenseId: 'e1' } },
      body: { categoryId: null, note: null },
    });
  });

  it('refuses a date in the future', async () => {
    renderDialog();
    const user = userEvent.setup();
    const when = await screen.findByLabelText('Дата й час');
    await user.clear(when);
    await user.type(when, '2026-10-09T10:00');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    expect(await screen.findByText('Дата не може бути в майбутньому')).toBeInTheDocument();
    expect(api.PATCH).not.toHaveBeenCalled();
  });

  it('deletes only after confirming', async () => {
    renderDialog();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Видалити' }));
    const confirm = await screen.findByRole('dialog', { name: 'Видалити запис' });
    expect(api.DELETE).not.toHaveBeenCalled();
    await user.click(within(confirm).getByRole('button', { name: 'Видалити' }));
    await vi.waitFor(() =>
      expect(api.DELETE).toHaveBeenCalledWith('/api/spaces/{spaceId}/expenses/{expenseId}', {
        params: { path: { spaceId: 's1', expenseId: 'e1' } },
      }),
    );
    await vi.waitFor(() => expect(notify).toHaveBeenCalledWith('Запис видалено'));
  });

  it('shows a server refusal in place', async () => {
    api.PATCH.mockResolvedValue({
      error: { statusCode: 400, code: 'WALLET_ARCHIVED', message: 'x' },
    });
    renderDialog();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Нотатка'), '!');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Гаманець в архіві');
    expect(notify).not.toHaveBeenCalled();
  });
});
