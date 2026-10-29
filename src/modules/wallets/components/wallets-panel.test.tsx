import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { WalletsPanel } from './wallets-panel';

// The amount's container: CountUpMoney renders the shown frame (aria-hidden) and the final value.
const amount = (text: RegExp, scope: { getByText: typeof screen.getByText } = screen) =>
  scope.getByText(text, { selector: '[aria-hidden="true"]' }).parentElement!.parentElement!;

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
    const cards = screen.getAllByRole('list')[1]!; // desktop cards (circles come first)
    expect(amount(/8\s240,50\s₴/, within(cards))).not.toHaveClass('text-destructive');
    expect(amount(/-45,00\s(USD|\$)/, within(cards))).toHaveClass('text-destructive');
  });

  it('invites to add the first wallet when there are none', async () => {
    get.mockResolvedValue({ data: [] });
    const onAdd = vi.fn();
    renderWithProviders(<WalletsPanel spaceId="sp1" onAdd={onAdd} />);
    expect(await screen.findByText('Тут житимуть ваші гроші')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: /Додати гаманець/ }));
    expect(onAdd).toHaveBeenCalled();
  });

  it('offers adding income per wallet: the desktop "+" and the mobile sheet', async () => {
    get.mockResolvedValue({
      data: [{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '1', icon: null, color: null }],
    });
    const onAddIncome = vi.fn();
    renderWithProviders(<WalletsPanel spaceId="sp1" onAdd={vi.fn()} onAddIncome={onAddIncome} />);
    const user = userEvent.setup();
    // Both variants are in the DOM (CSS shows one): the desktop card's "+" and the mobile circle.
    await user.click(await screen.findByRole('button', { name: 'Додати дохід: Mono' }));
    await user.click(screen.getByRole('button', { name: 'Гаманець Mono' }));
    const sheet = await screen.findByRole('dialog', { name: 'Mono' });
    await user.click(within(sheet).getByRole('button', { name: 'Дохід' }));
    expect(onAddIncome.mock.calls).toEqual([['w1'], ['w1']]);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens the wallet editor from the mobile sheet', async () => {
    get.mockResolvedValue({
      data: [
        { id: 'w1', name: 'Mono', currency: 'UAH', balance: '1', initialBalance: '0', color: null },
      ],
    });
    renderWithProviders(<WalletsPanel spaceId="sp1" onAdd={vi.fn()} onAddIncome={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Гаманець Mono' }));
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Mono' })).getByRole('button', {
        name: 'Редагувати',
      }),
    );
    expect(await screen.findByRole('dialog', { name: 'Гаманець' })).toBeInTheDocument();
  });

  it('keeps the sheet reachable by keyboard when the circles are draggable', async () => {
    get.mockResolvedValue({
      data: [{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '1', icon: null, color: null }],
    });
    renderWithProviders(
      <WalletsPanel
        spaceId="sp1"
        onAdd={vi.fn()}
        onAddIncome={vi.fn()}
        // Like the dashboard: the wrapper owns the element (and Enter/Space start a drag there).
        wrap={(_id, node) => <div role="button">{node}</div>}
      />,
    );
    const button = await screen.findByRole('button', { name: 'Гаманець Mono' });
    button.focus();
    await userEvent.setup().keyboard('{Enter}');
    expect(await screen.findByRole('dialog', { name: 'Mono' })).toBeInTheDocument();
  });

  it('shows a skeleton while wallets load, not a blank space', () => {
    get.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<WalletsPanel spaceId="sp1" onAdd={vi.fn()} />);
    const region = screen.getByText('Завантаження…').closest('[aria-busy="true"]')!;
    expect(region.querySelectorAll('[data-skeleton="card"]')).toHaveLength(2);
    expect(region.querySelectorAll('[data-skeleton="circle"]')).toHaveLength(2);
  });

  it('replaces the skeleton with the error when wallets fail', async () => {
    get.mockResolvedValue({ error: { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x' } });
    renderWithProviders(<WalletsPanel spaceId="sp1" onAdd={vi.fn()} />);
    expect(await screen.findByRole('button', { name: 'Спробувати ще раз' })).toBeInTheDocument();
    expect(screen.queryByText('Завантаження…')).toBeNull();
  });

  it('opens the wallet editor from the desktop card', async () => {
    get.mockResolvedValue({
      data: [
        { id: 'w1', name: 'Mono', currency: 'UAH', balance: '1', initialBalance: '0', color: null },
      ],
    });
    renderWithProviders(<WalletsPanel spaceId="sp1" onAdd={vi.fn()} />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Редагувати: Mono' }));
    expect(await screen.findByRole('dialog', { name: 'Гаманець' })).toBeInTheDocument();
  });

  it("shows each wallet's name and balance under its circle on phones", async () => {
    get.mockResolvedValue({
      data: [
        { id: 'w1', name: 'Mono', currency: 'UAH', balance: '8240.5', icon: null, color: null },
        { id: 'w2', name: 'USD', currency: 'USD', balance: '-45', icon: null, color: null },
      ],
    });
    renderWithProviders(<WalletsPanel spaceId="sp1" onAdd={vi.fn()} />);
    const mobile = (await screen.findAllByRole('list'))[0]!; // the circles list comes first
    expect(within(mobile).getByText('Mono')).toBeInTheDocument();
    expect(amount(/8\s240,50\s₴/, within(mobile))).toBeInTheDocument();
    expect(amount(/-45,00\s(USD|\$)/, within(mobile))).toHaveClass('text-destructive');
  });

  it('shows wallet cards 2 per row on tablets and as a column next to the categories', async () => {
    get.mockResolvedValue({
      data: [{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '1', icon: null, color: null }],
    });
    const { container } = renderWithProviders(<WalletsPanel spaceId="sp1" onAdd={() => {}} />);
    await screen.findAllByText('Mono');
    const cards = container.querySelector('ul.hidden')!;
    expect(cards).toHaveClass('md:grid', 'md:grid-cols-2', 'lg:flex', 'lg:flex-col');
  });
});
