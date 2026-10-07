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

  it('offers adding income per wallet', async () => {
    get.mockResolvedValue({
      data: [{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '1', icon: null, color: null }],
    });
    const onAddIncome = vi.fn();
    renderWithProviders(<WalletsPanel spaceId="sp1" onAdd={vi.fn()} onAddIncome={onAddIncome} />);
    // Both variants are in the DOM (CSS shows one): the desktop card's "+" and the mobile circle.
    const buttons = await screen.findAllByRole('button', { name: 'Додати дохід: Mono' });
    expect(buttons).toHaveLength(2);
    const user = userEvent.setup();
    for (const button of buttons) await user.click(button);
    expect(onAddIncome.mock.calls).toEqual([['w1'], ['w1']]);
  });

  it('keeps adding income reachable by keyboard when the circles are draggable', async () => {
    get.mockResolvedValue({
      data: [{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '1', icon: null, color: null }],
    });
    const onAddIncome = vi.fn();
    renderWithProviders(
      <WalletsPanel
        spaceId="sp1"
        onAdd={vi.fn()}
        onAddIncome={onAddIncome}
        // Like the dashboard: the wrapper owns the element (and Enter/Space start a drag there).
        wrap={(_id, node) => <div role="button">{node}</div>}
      />,
    );
    const buttons = await screen.findAllByRole('button', { name: 'Додати дохід: Mono' });
    expect(buttons).toHaveLength(2); // desktop "+" and the circle's own
    buttons[0].focus();
    await userEvent.setup().keyboard('{Enter}');
    expect(onAddIncome).toHaveBeenCalledWith('w1');
  });
});
