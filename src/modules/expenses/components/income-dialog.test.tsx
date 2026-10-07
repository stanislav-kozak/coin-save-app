import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { IncomeDialog } from './income-dialog';

const post = vi.fn();
const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: { POST: (...a: unknown[]) => post(...a), GET: (...a: unknown[]) => get(...a) },
}));

beforeEach(() => {
  post.mockReset();
  get.mockReset();
  get.mockResolvedValue({
    data: [
      { id: 'w1', name: 'Mono', currency: 'UAH', balance: '100' },
      { id: 'w2', name: 'Cash', currency: 'USD', balance: '10' },
    ],
  });
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 31, 12));
});
afterEach(() => {
  vi.useRealTimers();
});

function Harness() {
  const [open, setOpen] = useState(true);
  return <IncomeDialog spaceId="sp1" walletId="w1" open={open} onOpenChange={setOpen} />;
}
const renderIncome = () => renderWithProviders(<Harness />);

/** Like the launcher: one dialog, the wallet set by whichever "+" was pressed last. */
function Launcher() {
  const [open, setOpen] = useState(false);
  const [walletId, setWalletId] = useState('');
  const openFor = (id: string) => {
    setWalletId(id);
    setOpen(true);
  };
  return (
    <>
      <button onClick={() => openFor('w1')}>plus-mono</button>
      <button onClick={() => openFor('w2')}>plus-cash</button>
      <IncomeDialog spaceId="sp1" walletId={walletId} open={open} onOpenChange={setOpen} />
    </>
  );
}

describe('IncomeDialog', () => {
  it('adds the income now and a monthly rule from next month', async () => {
    post.mockResolvedValue({ data: { id: 'x' } });
    renderIncome();
    const user = userEvent.setup();
    expect(await screen.findByText(/Mono/)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Сума'), '15000');
    await user.click(screen.getByRole('checkbox', { name: 'Щомісяця, 31-го числа' }));
    await user.type(screen.getByLabelText('Назва'), 'Зарплата');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(post.mock.calls[0]).toEqual([
      '/api/spaces/{spaceId}/expenses',
      expect.objectContaining({
        body: expect.objectContaining({ walletId: 'w1', type: 'INCOME', amount: 15000 }),
      }),
    ]);
    expect(post.mock.calls[1]).toEqual([
      '/api/spaces/{spaceId}/recurring',
      expect.objectContaining({
        body: {
          walletId: 'w1',
          type: 'INCOME',
          amount: 15000,
          name: 'Зарплата',
          frequency: 'MONTHLY',
          dayOfMonth: 31,
          startDate: '2026-11-01',
        },
      }),
    ]);
  });

  it('adds a one-off income without a monthly rule', async () => {
    post.mockResolvedValue({ data: { id: 'x' } });
    renderIncome();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '250');
    expect(screen.queryByLabelText('Назва')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  });

  it('retries only the monthly rule when it failed after the income was added', async () => {
    post
      .mockResolvedValueOnce({ data: { id: 'e1' } })
      .mockResolvedValueOnce({ error: { statusCode: 400, code: 'WALLET_ARCHIVED', message: 'x' } })
      .mockResolvedValueOnce({ data: { id: 'r1' } });
    renderIncome();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '15000');
    await user.click(screen.getByRole('checkbox', { name: /Щомісяця/ }));
    await user.type(screen.getByLabelText('Назва'), 'Зарплата');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Дохід додано, але щомісячне повторення не створено',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Гаманець в архіві');
    await user.click(screen.getByRole('button', { name: 'Створити повторення' }));
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(3));
    expect(post.mock.calls[2][0]).toBe('/api/spaces/{spaceId}/recurring');
  });

  it('reopens with the values when the income itself fails', async () => {
    post.mockResolvedValue({ error: { statusCode: 400, code: 'WALLET_ARCHIVED', message: 'x' } });
    renderIncome();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '250');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Гаманець в архіві');
    expect(screen.getByLabelText('Сума')).toHaveValue('250');
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('asks for a name before creating a monthly rule', async () => {
    renderIncome();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '250');
    await user.click(screen.getByRole('checkbox', { name: /Щомісяця/ }));
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    expect(await screen.findByText('Введіть назву')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('reopens a failed income for its own wallet even after another wallet\'s "+" was pressed', async () => {
    let answer!: (v: unknown) => void;
    post
      .mockReturnValueOnce(new Promise((r) => (answer = r)))
      .mockResolvedValueOnce({ data: { id: 'e2' } });
    renderWithProviders(<Launcher />);
    const user = userEvent.setup();
    await user.click(screen.getByText('plus-mono'));
    await user.type(await screen.findByLabelText('Сума'), '15000');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    await vi.waitFor(() => expect(screen.queryByLabelText('Сума')).not.toBeInTheDocument());
    await user.click(screen.getByText('plus-cash'));
    await user.keyboard('{Escape}');
    answer({ error: { statusCode: 400, code: 'WALLET_ARCHIVED', message: 'x' } });
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Mono')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(post.mock.calls[1][1].body).toMatchObject({ walletId: 'w1', amount: 15000 });
  });

  it('repeats on the day the label promised, even if midnight passes while it is open', async () => {
    vi.setSystemTime(new Date(2026, 9, 31, 23, 59));
    post.mockResolvedValue({ data: { id: 'x' } });
    renderIncome();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '100');
    await user.click(screen.getByRole('checkbox', { name: 'Щомісяця, 31-го числа' }));
    await user.type(screen.getByLabelText('Назва'), 'Оренда');
    vi.setSystemTime(new Date(2026, 10, 1, 0, 1));
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(post.mock.calls[1][1].body).toMatchObject({ dayOfMonth: 31, startDate: '2026-11-01' });
    // …and the income itself is dated then too, so November doesn't get it twice (now + on the 30th).
    expect(post.mock.calls[0][1].body.occurredAt).toBe(new Date(2026, 9, 31, 23, 59).toISOString());
  });
});
