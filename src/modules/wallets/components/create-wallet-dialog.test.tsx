import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { CreateWalletDialog } from './create-wallet-dialog';

const post = vi.fn();
const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: { POST: (...a: unknown[]) => post(...a), GET: (...a: unknown[]) => get(...a) },
}));
const notify = vi.fn();
vi.mock('@/shared/ui/toaster', () => ({ notify: (...a: unknown[]) => notify(...a) }));
beforeEach(() => notify.mockReset());

beforeEach(() => {
  post.mockReset();
  get.mockReset();
  get.mockResolvedValue({ data: [] });
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
      body: { name: 'Mono', currency: 'UAH', initialBalance: 1250.5, color: '#3b82f6' },
    });
    await vi.waitFor(() => expect(notify).toHaveBeenCalledWith('Гаманець збережено'));
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
    expect(notify).not.toHaveBeenCalled();
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

  it('sends the chosen color, defaulting to the first one no wallet uses', async () => {
    get.mockResolvedValue({
      data: [{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '0', color: '#3b82f6' }],
    });
    post.mockResolvedValue({ data: { id: 'w2' } });
    renderWithProviders(<CreateWalletDialog spaceId="sp1" open onOpenChange={vi.fn()} />);
    const user = userEvent.setup();
    await vi.waitFor(() => expect(screen.getByRole('radio', { name: 'Бірюзовий' })).toBeChecked());
    await user.type(screen.getByLabelText('Назва'), 'Cash');
    await user.click(screen.getByRole('radio', { name: 'Бурштиновий' }));
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    await vi.waitFor(() => expect(post).toHaveBeenCalled());
    expect(post.mock.calls[0][1].body).toMatchObject({ name: 'Cash', color: '#f59e0b' });
  });

  it('keeps what was typed when the wallets list changes meanwhile', async () => {
    let answer!: (v: unknown) => void;
    get.mockReturnValue(new Promise((r) => (answer = r)));
    renderWithProviders(<CreateWalletDialog spaceId="sp1" open onOpenChange={vi.fn()} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Назва'), 'Cash');
    answer({ data: [{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '0', color: '#3b82f6' }] });
    await vi.waitFor(() => expect(screen.getByRole('radio', { name: 'Бірюзовий' })).toBeChecked());
    expect(screen.getByLabelText('Назва')).toHaveValue('Cash');
  });
});
