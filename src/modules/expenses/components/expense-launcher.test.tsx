import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { ExpenseLauncherProvider, NewExpenseButton } from './expense-launcher';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: { GET: (...a: unknown[]) => get(...a), POST: vi.fn() },
}));

beforeEach(() => {
  get.mockReset();
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
