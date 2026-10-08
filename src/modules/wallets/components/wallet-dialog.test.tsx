import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { WalletDialog } from './wallet-dialog';

const patch = vi.fn();
const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: { PATCH: (...a: unknown[]) => patch(...a), GET: (...a: unknown[]) => get(...a) },
}));

const mono = {
  id: 'w1',
  name: 'Mono',
  currency: 'UAH',
  color: '#3b82f6',
  initialBalance: '8240.5',
  balance: '1000',
};

beforeEach(() => {
  patch.mockReset();
  get.mockReset();
  get.mockImplementation(async (path: string) =>
    path === '/api/currencies/rate'
      ? { data: { from: 'UAH', to: 'USD', rate: '0.0241', date: '2026-10-08' } }
      : { data: [] },
  );
});

const renderDialog = (onOpenChange = vi.fn()) =>
  renderWithProviders(
    <WalletDialog spaceId="sp1" wallet={mono} open onOpenChange={onOpenChange} />,
  );

describe('WalletDialog', () => {
  it('edits name, color and initial balance without asking to confirm', async () => {
    patch.mockResolvedValue({ data: mono });
    const onOpenChange = vi.fn();
    renderDialog(onOpenChange);
    const user = userEvent.setup();
    expect(screen.getByLabelText('Валюта')).toHaveValue('UAH');
    expect(screen.getByLabelText('Початковий баланс')).toHaveValue('8240.5');
    await user.clear(screen.getByLabelText('Назва'));
    await user.type(screen.getByLabelText('Назва'), 'Monobank');
    await user.click(screen.getByRole('radio', { name: 'Бурштиновий' }));
    await user.clear(screen.getByLabelText('Початковий баланс'));
    await user.type(screen.getByLabelText('Початковий баланс'), '1 250,50');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(patch).toHaveBeenCalledWith('/api/spaces/{spaceId}/wallets/{walletId}', {
      params: { path: { spaceId: 'sp1', walletId: 'w1' } },
      body: { name: 'Monobank', color: '#f59e0b', initialBalance: 1250.5 },
    });
  });

  it('previews a currency change and locks the initial balance', async () => {
    const consoleError = vi.spyOn(console, 'error');
    renderDialog();
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText('Валюта'), 'USD');
    expect(await screen.findByText(/≈\s?24,10\s\$/)).toBeInTheDocument();
    expect(screen.getByLabelText('Початковий баланс')).toBeDisabled();
    expect(screen.getByLabelText('Початковий баланс')).toHaveValue('8240.5');
    // Two different inputs, not one switching from uncontrolled to controlled.
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('changes the currency only after confirming, then refreshes everything it touched', async () => {
    patch.mockResolvedValue({ data: { ...mono, currency: 'USD' } });
    const onOpenChange = vi.fn();
    const { queryClient } = renderDialog(onOpenChange);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('Початковий баланс'));
    await user.type(screen.getByLabelText('Початковий баланс'), '5');
    await user.selectOptions(screen.getByLabelText('Валюта'), 'USD');
    await screen.findByText(/≈/);
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    expect(screen.getByText(/за сьогоднішнім курсом/)).toBeInTheDocument();
    expect(patch).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Змінити валюту' }));
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(patch).toHaveBeenCalledWith('/api/spaces/{spaceId}/wallets/{walletId}', {
      params: { path: { spaceId: 'sp1', walletId: 'w1' } },
      body: { currency: 'USD' }, // the balance is converted by the server, not sent
    });
    const keys = invalidate.mock.calls.map((c) => c[0]?.queryKey);
    for (const key of [
      ['wallets', 'sp1'],
      ['expenses', 'sp1'],
      ['analytics', 'sp1'],
      ['recurring', 'sp1'],
    ]) {
      expect(keys).toContainEqual(key);
    }
  });

  it('goes back to the form with its values when the change is cancelled', async () => {
    renderDialog();
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText('Валюта'), 'USD');
    await screen.findByText(/≈/);
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await user.click(screen.getByRole('button', { name: 'Скасувати' }));
    expect(screen.getByLabelText('Валюта')).toHaveValue('USD');
    expect(patch).not.toHaveBeenCalled();
  });

  it('switching back to the wallet currency undoes the change', async () => {
    patch.mockResolvedValue({ data: mono });
    renderDialog();
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText('Валюта'), 'USD');
    await user.selectOptions(screen.getByLabelText('Валюта'), 'UAH');
    expect(screen.queryByText(/≈/)).toBeNull();
    expect(screen.getByLabelText('Початковий баланс')).toBeEnabled();
    await user.clear(screen.getByLabelText('Назва'));
    await user.type(screen.getByLabelText('Назва'), 'Monobank');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(patch).toHaveBeenCalled());
    expect(patch.mock.calls[0]![1].body).toEqual({ name: 'Monobank' });
  });

  it('shows why the currency could not be changed', async () => {
    patch.mockResolvedValue({
      error: { statusCode: 503, code: 'CURRENCY_API_UNAVAILABLE', message: 'x' },
    });
    renderDialog();
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText('Валюта'), 'USD');
    await screen.findByText(/≈/);
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await user.click(screen.getByRole('button', { name: 'Змінити валюту' }));
    expect(await screen.findByRole('alert')).not.toHaveTextContent(/^$/);
  });

  it('archives only after confirming', async () => {
    patch.mockResolvedValue({ data: { ...mono, archived: true } });
    renderDialog();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Архівувати' }));
    expect(screen.getByText(/історія збережеться/)).toBeInTheDocument();
    expect(patch).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Архівувати гаманець' }));
    await vi.waitFor(() =>
      expect(patch).toHaveBeenCalledWith('/api/spaces/{spaceId}/wallets/{walletId}/archive', {
        params: { path: { spaceId: 'sp1', walletId: 'w1' } },
      }),
    );
  });

  it('shows a server refusal in place', async () => {
    patch.mockResolvedValue({ error: { statusCode: 404, code: 'WALLET_NOT_FOUND', message: 'x' } });
    renderDialog();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Зберегти' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('sends only what changed, so a wallet without a color keeps none', async () => {
    patch.mockResolvedValue({ data: mono });
    renderWithProviders(
      <WalletDialog spaceId="sp1" wallet={{ ...mono, color: null }} open onOpenChange={vi.fn()} />,
    );
    const user = userEvent.setup();
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
    await user.type(screen.getByLabelText('Назва'), ' 2');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(patch).toHaveBeenCalled());
    expect(patch.mock.calls[0][1].body).toEqual({ name: 'Mono 2' });
  });
});
