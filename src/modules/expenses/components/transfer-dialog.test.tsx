import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { TransferDialog } from './transfer-dialog';

const api = { GET: vi.fn(), POST: vi.fn(), PATCH: vi.fn(), DELETE: vi.fn() };
vi.mock('@/shared/lib/api-client', () => ({
  api: {
    GET: (...a: unknown[]) => api.GET(...a),
    POST: (...a: unknown[]) => api.POST(...a),
    PATCH: (...a: unknown[]) => api.PATCH(...a),
    DELETE: (...a: unknown[]) => api.DELETE(...a),
  },
}));
const notify = vi.fn();
vi.mock('@/shared/ui/toaster', () => ({ notify: (...a: unknown[]) => notify(...a) }));

const WALLETS = [
  { id: 'mono', name: 'Mono', currency: 'UAH', balance: '1000', archived: false },
  { id: 'cash', name: 'Cash', currency: 'UAH', balance: '50', archived: false },
  { id: 'usd', name: 'Savings', currency: 'USD', balance: '300', archived: false },
  { id: 'old', name: 'Old', currency: 'UAH', balance: '0', archived: true },
];

beforeEach(() => {
  for (const m of Object.values(api)) m.mockReset();
  notify.mockReset();
  api.GET.mockImplementation(async (path: string) =>
    path === '/api/currencies/rate' ? { data: { rate: '0.024' } } : { data: WALLETS },
  );
  api.POST.mockResolvedValue({ data: { id: 't1' } });
  api.PATCH.mockResolvedValue({ data: { id: 't1' } });
  api.DELETE.mockResolvedValue({});
});

const onOpenChange = vi.fn();
const renderCreate = (prefill?: { fromWalletId?: string; toWalletId?: string }) =>
  renderWithProviders(
    <TransferDialog spaceId="s1" open onOpenChange={onOpenChange} prefill={prefill} />,
  );

describe('TransferDialog', () => {
  it('moves money between two wallets of one currency', async () => {
    renderCreate({ fromWalletId: 'mono', toWalletId: 'cash' });
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '250,5');
    await user.type(screen.getByLabelText('Нотатка'), 'Банкомат');
    // One currency: no received amount to ask for.
    expect(screen.queryByLabelText('Отримано')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Переказати' }));
    await vi.waitFor(() => expect(api.POST).toHaveBeenCalled());
    const [path, { body }] = api.POST.mock.calls[0];
    expect(path).toBe('/api/spaces/{spaceId}/transfers');
    expect(body).toMatchObject({
      fromWalletId: 'mono',
      toWalletId: 'cash',
      amount: 250.5,
      note: 'Банкомат',
    });
    expect(body.toAmount).toBeUndefined();
    expect(typeof body.occurredAt).toBe('string');
    expect(notify).toHaveBeenCalledWith('Переказ збережено');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('offers only active wallets, and never the source as the target', async () => {
    renderCreate({ fromWalletId: 'mono' });
    const to = await screen.findByLabelText('На гаманець');
    const names = [...to.querySelectorAll('option')].map((o) => o.textContent);
    expect(names).toEqual(['Оберіть гаманець', 'Cash · UAH', 'Savings · USD']);
  });

  it('asks for a target wallet before saving', async () => {
    renderCreate({ fromWalletId: 'mono' });
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '10');
    await user.click(screen.getByRole('button', { name: 'Переказати' }));
    expect(await screen.findByText('Оберіть гаманець', { selector: 'p' })).toBeInTheDocument();
    expect(api.POST).not.toHaveBeenCalled();
  });

  it('between currencies, estimates the received amount and lets it be typed', async () => {
    renderCreate({ fromWalletId: 'mono', toWalletId: 'usd' });
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '1000');
    const received = screen.getByLabelText('Отримано');
    await vi.waitFor(() =>
      expect(received.getAttribute('placeholder')).toMatch(/^≈ 24,00\s\$ за курсом$/),
    );
    await user.type(received, '23.8');
    await user.click(screen.getByRole('button', { name: 'Переказати' }));
    await vi.waitFor(() => expect(api.POST).toHaveBeenCalled());
    expect(api.POST.mock.calls[0][1].body).toMatchObject({ amount: 1000, toAmount: 23.8 });
  });

  it('leaves the conversion to the server when the received amount is empty', async () => {
    renderCreate({ fromWalletId: 'mono', toWalletId: 'usd' });
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '1000');
    await user.click(screen.getByRole('button', { name: 'Переказати' }));
    await vi.waitFor(() => expect(api.POST).toHaveBeenCalled());
    expect(api.POST.mock.calls[0][1].body.toAmount).toBeUndefined();
  });

  it('shows what the server refused, in words', async () => {
    api.POST.mockResolvedValue({
      error: { statusCode: 409, code: 'WALLET_ARCHIVED', message: 'x' },
    });
    renderCreate({ fromWalletId: 'mono', toWalletId: 'cash' });
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '10');
    await user.click(screen.getByRole('button', { name: 'Переказати' }));
    expect(await screen.findByRole('alert')).not.toHaveTextContent('WALLET_ARCHIVED');
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  describe('editing a saved transfer', () => {
    const saved = {
      id: 't1',
      walletId: 'mono',
      toWalletId: 'usd',
      amount: '1000',
      toAmount: '24',
      walletCurrency: 'UAH',
      toWalletCurrency: 'USD',
      note: 'Обмін',
      occurredAt: '2026-10-30T10:00:00.000Z',
    };
    const renderEdit = () =>
      renderWithProviders(
        <TransferDialog spaceId="s1" open onOpenChange={onOpenChange} transfer={saved} />,
      );

    it('sends only what changed; a cleared note becomes null', async () => {
      renderEdit();
      const user = userEvent.setup();
      const amount = await screen.findByLabelText('Сума');
      expect(screen.getByLabelText('Отримано')).toHaveValue('24');
      await user.clear(amount);
      await user.type(amount, '1200');
      await user.clear(screen.getByLabelText('Нотатка'));
      await user.click(screen.getByRole('button', { name: 'Зберегти' }));
      await vi.waitFor(() => expect(api.PATCH).toHaveBeenCalled());
      const [path, { params, body }] = api.PATCH.mock.calls[0];
      expect(path).toBe('/api/spaces/{spaceId}/transfers/{transferId}');
      expect(params.path).toEqual({ spaceId: 's1', transferId: 't1' });
      expect(body).toEqual({ amount: 1200, note: null });
    });

    it('deletes after a confirmation', async () => {
      renderEdit();
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: 'Видалити' }));
      await user.click(screen.getByRole('button', { name: 'Видалити' }));
      await vi.waitFor(() => expect(api.DELETE).toHaveBeenCalled());
      expect(api.DELETE.mock.calls[0][1].params.path).toEqual({ spaceId: 's1', transferId: 't1' });
    });
  });
});
