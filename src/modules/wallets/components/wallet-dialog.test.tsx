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
};

beforeEach(() => {
  patch.mockReset();
  get.mockReset();
  get.mockResolvedValue({ data: [] });
});

const renderDialog = (onOpenChange = vi.fn()) =>
  renderWithProviders(
    <WalletDialog spaceId="sp1" wallet={mono} open onOpenChange={onOpenChange} />,
  );

describe('WalletDialog', () => {
  it('edits name, color and initial balance; the currency stays fixed', async () => {
    patch.mockResolvedValue({ data: mono });
    const onOpenChange = vi.fn();
    renderDialog(onOpenChange);
    const user = userEvent.setup();
    expect(screen.getByText('UAH')).toBeInTheDocument();
    expect(screen.queryByLabelText('Валюта')).toBeNull();
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
});
