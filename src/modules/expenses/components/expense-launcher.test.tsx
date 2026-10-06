import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { ExpenseLauncherProvider, NewExpenseButton, useExpenseLauncher } from './expense-launcher';

const get = vi.fn();
const post = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: { GET: (...a: unknown[]) => get(...a), POST: (...a: unknown[]) => post(...a) },
}));

beforeEach(() => {
  get.mockReset();
  post.mockReset();
});

function setup() {
  renderWithProviders(
    <ExpenseLauncherProvider spaceId="sp1">
      <NewExpenseButton />
    </ExpenseLauncherProvider>,
  );
}

describe('NewExpenseButton', () => {
  it('opens the expense form with wallet and category pickers', async () => {
    get.mockImplementation(async (path: string) =>
      path.endsWith('/wallets')
        ? { data: [{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '1' }] }
        : { data: [] },
    );
    setup();
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Нова витрата' }));
    expect(await screen.findByRole('dialog', { name: 'Нова витрата' })).toBeInTheDocument();
    expect(screen.getByLabelText('Гаманець')).toBeInTheDocument();
  });

  it('asks to add a wallet first when there is none', async () => {
    get.mockResolvedValue({ data: [] });
    setup();
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Нова витрата' }));
    expect(await screen.findByRole('dialog', { name: 'Новий гаманець' })).toBeInTheDocument();
  });
});

function PendingProbe() {
  const { pendingSpends, openExpense } = useExpenseLauncher();
  return (
    <>
      <button onClick={() => openExpense({ walletId: 'w1', categoryId: 'c1' })}>drop</button>
      <output aria-label="pending">
        {pendingSpends.map((s) => `${s.categoryId}:${s.amount}:${s.currency}`).join(',')}
      </output>
    </>
  );
}

describe('pending category spends', () => {
  beforeEach(() => {
    get.mockImplementation(async (path: string) =>
      path.endsWith('/wallets')
        ? { data: [{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '1000' }] }
        : { data: [{ id: 'c1', name: 'Кафе', icon: '☕', color: '#A855F7' }] },
    );
  });

  async function dropAndSubmit() {
    renderWithProviders(
      <ExpenseLauncherProvider spaceId="sp1">
        <PendingProbe />
      </ExpenseLauncherProvider>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText('drop'));
    await user.type(await screen.findByLabelText('Сума'), '85');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
  }

  it('shows the expense on its category until the server has answered', async () => {
    let answer!: (v: unknown) => void;
    post.mockReturnValue(new Promise((r) => (answer = r)));
    await dropAndSubmit();
    expect(await screen.findByLabelText('pending')).toHaveTextContent('c1:85:UAH');
    answer({ data: { id: 'e1' } });
    await vi.waitFor(() => expect(screen.getByLabelText('pending')).toHaveTextContent(''));
  });

  it('drops it again when the server refuses', async () => {
    post.mockResolvedValue({ error: { statusCode: 400, code: 'WALLET_ARCHIVED', message: 'x' } });
    await dropAndSubmit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Гаманець в архіві');
    expect(screen.getByLabelText('pending')).toHaveTextContent('');
  });
});
