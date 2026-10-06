import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { CreateWalletDialog } from './create-wallet-dialog';

const post = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { POST: (...a: unknown[]) => post(...a) } }));

beforeEach(() => {
  post.mockReset();
});

async function fill(user: ReturnType<typeof userEvent.setup>, balance: string) {
  await user.type(screen.getByLabelText('Назва'), 'Mono');
  await user.type(screen.getByLabelText('Початковий баланс'), balance);
}

describe('CreateWalletDialog', () => {
  it('creates the wallet and closes', async () => {
    post.mockResolvedValue({ data: { id: 'w1' } });
    const onOpenChange = vi.fn();
    renderWithProviders(<CreateWalletDialog spaceId="sp1" open onOpenChange={onOpenChange} />);
    const user = userEvent.setup();
    await fill(user, '1250,50');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(post).toHaveBeenCalledWith('/api/spaces/{spaceId}/wallets', {
      params: { path: { spaceId: 'sp1' } },
      body: { name: 'Mono', currency: 'UAH', initialBalance: 1250.5 },
    });
  });

  it('shows a server error in the current language', async () => {
    post.mockResolvedValue({
      error: { statusCode: 400, code: 'CURRENCY_NOT_SUPPORTED', message: 'x' },
    });
    renderWithProviders(<CreateWalletDialog spaceId="sp1" open onOpenChange={vi.fn()} />);
    const user = userEvent.setup();
    await fill(user, '0');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Валюта не підтримується');
  });

  it('creates one wallet even if clicked again while saving', async () => {
    let resolve!: (v: unknown) => void;
    post.mockReturnValue(new Promise((r) => (resolve = r)));
    renderWithProviders(<CreateWalletDialog spaceId="sp1" open onOpenChange={vi.fn()} />);
    const user = userEvent.setup();
    await fill(user, '0');
    const button = screen.getByRole('button', { name: 'Додати' });
    await user.click(button);
    await user.click(button);
    resolve({ data: { id: 'w1' } });
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  });
});
