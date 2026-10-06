import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { WalletsPanel } from './wallets-panel';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

beforeEach(() => {
  get.mockReset();
});

describe('WalletsPanel', () => {
  it('lists wallets with their balance, negative in red', async () => {
    get.mockResolvedValue({
      data: [
        {
          id: 'w1',
          name: 'Family Card',
          currency: 'UAH',
          balance: '8240.5',
          icon: null,
          color: '#3B82F6',
        },
        { id: 'w2', name: 'USD Savings', currency: 'USD', balance: '-45', icon: null, color: null },
      ],
    });
    renderWithProviders(<WalletsPanel spaceId="sp1" onAdd={vi.fn()} />);
    expect(await screen.findByRole('heading', { name: 'Family Card' })).toBeInTheDocument();
    expect(screen.getByText(/8\s240,50\s₴/)).not.toHaveClass('text-destructive');
    expect(screen.getByText(/-45,00\s(USD|\$)/)).toHaveClass('text-destructive');
  });

  it('invites to add the first wallet when there are none', async () => {
    get.mockResolvedValue({ data: [] });
    const onAdd = vi.fn();
    renderWithProviders(<WalletsPanel spaceId="sp1" onAdd={onAdd} />);
    expect(await screen.findByText('Ще немає гаманців')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: /Додати гаманець/ }));
    expect(onAdd).toHaveBeenCalled();
  });
});
