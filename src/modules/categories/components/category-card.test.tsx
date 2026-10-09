import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { CategoriesGrid } from './categories-grid';
import { CategoryCard, CategoryTile } from './category-card';

// The amount's container: CountUpMoney renders the shown frame (aria-hidden) and the final value.
const amount = (text: RegExp, scope: { getByText: typeof screen.getByText } = screen) =>
  scope.getByText(text, { selector: '[aria-hidden="true"]' }).parentElement!.parentElement!;

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

const groceries = {
  id: 'c1',
  name: 'Продукти',
  icon: '🛒',
  color: '#F97350',
  monthlyLimit: '2000',
};

beforeEach(() => {
  get.mockReset(); // block body: a returned function would run as a teardown hook
});

describe('CategoryCard', () => {
  it('shows the over-limit badge outside the header so the name keeps its width', () => {
    renderWithProviders(
      <CategoryCard
        category={{ ...groceries, name: 'Комунальні платежі' }}
        spent="2400"
        pct={120}
        currency="UAH"
      />,
    );
    const badge = screen.getByText(/понад ліміт/).parentElement!;
    expect(badge.closest('header')).toBeNull();
    expect(badge).toHaveClass('absolute');
  });

  it('shows spent of limit with percentage', () => {
    renderWithProviders(<CategoryCard category={groceries} spent="1200" pct={60} currency="UAH" />);
    expect(screen.getByText(/1\s200,00\s₴ \/ 2\s000,00\s₴ · 60%/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Продукти' })).toHaveAttribute(
      'aria-valuenow',
      '60',
    );
  });

  it('flags an over-limit category with the exact excess', () => {
    renderWithProviders(
      <CategoryCard category={groceries} spent="2400.10" pct={120} currency="UAH" />,
    );
    expect(screen.getByText(/\+400,10\s₴/)).toBeInTheDocument();
    expect(screen.getByText('понад ліміт')).toBeInTheDocument();
  });

  it('never shows a negative excess when the rounded pct says 100', () => {
    renderWithProviders(
      <CategoryCard category={groceries} spent="1995" pct={100} currency="UAH" />,
    );
    expect(screen.queryByText('понад ліміт')).toBeNull();
    expect(screen.queryByText(/\+-/)).toBeNull();
  });

  it('shows no "+0,00" badge when spending exactly the limit', () => {
    renderWithProviders(
      <CategoryCard category={groceries} spent="2000" pct={100} currency="UAH" />,
    );
    expect(screen.queryByText('понад ліміт')).toBeNull();
  });

  it('shows only the spent amount without a limit', () => {
    renderWithProviders(
      <CategoryCard
        category={{ ...groceries, monthlyLimit: null }}
        spent="450"
        pct={0}
        currency="UAH"
      />,
    );
    expect(screen.getByText(/450,00\s₴ витрачено/)).toBeInTheDocument();
  });
});

describe('CategoriesGrid', () => {
  it('shows categories without spending this month as zero', async () => {
    get.mockImplementation(async (path: string) =>
      path.endsWith('/categories')
        ? {
            data: [
              { ...groceries, sortOrder: 1 },
              {
                id: 'c2',
                name: 'Розваги',
                icon: '🎬',
                color: '#EC4899',
                monthlyLimit: null,
                sortOrder: 2,
              },
            ],
          }
        : {
            data: {
              currency: 'UAH',
              byCategory: [
                {
                  categoryId: 'c1',
                  spent: '100',
                  currency: 'UAH' as const,
                  spentInCurrency: '100',
                  limit: '2000',
                  pct: 5,
                },
              ],
            },
          },
    );
    renderWithProviders(<CategoriesGrid spaceId="sp1" />);
    expect(await screen.findByText(/0,00\s₴ витрачено/)).toBeInTheDocument();
    expect(screen.getAllByText('Розваги').length).toBeGreaterThan(0);
  });

  it('explains a failed load and retries instead of vanishing', async () => {
    let failed = false;
    get.mockImplementation(async (path: string) => {
      if (path.endsWith('/analytics') && !failed) {
        failed = true;
        return { error: { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x' } };
      }
      return path.endsWith('/categories')
        ? { data: [{ ...groceries, sortOrder: 1 }] }
        : { data: { currency: 'UAH', byCategory: [] } };
    });
    renderWithProviders(<CategoriesGrid spaceId="sp1" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Помилка сервера');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Спробувати ще раз' }));
    expect(await screen.findByRole('progressbar', { name: 'Продукти' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('CategoryTile (mobile)', () => {
  it('shows the name and the spent amount under the icon, filled by the share of the limit', () => {
    renderWithProviders(
      <CategoryTile category={groceries} spent="1200" pct={60} currency="UAH" onEdit={() => {}} />,
    );
    const tile = screen.getByRole('button', { name: 'Редагувати: Продукти' });
    expect(tile).toHaveTextContent('Продукти');
    expect(tile).toHaveTextContent(/1\s200,00\s₴/);
    const fill = tile.querySelector<HTMLElement>('[data-fill]')!;
    expect(fill.style.height).toBe('60%');
  });

  it('has no fill without a limit and marks an exceeded one in red', () => {
    renderWithProviders(
      <>
        <CategoryTile
          category={{ ...groceries, id: 'a', monthlyLimit: null }}
          spent="10"
          pct={0}
          currency="UAH"
        />
        <CategoryTile category={{ ...groceries, id: 'b' }} spent="2400" pct={120} currency="UAH" />
      </>,
    );
    const fills = document.querySelectorAll<HTMLElement>('[data-fill]');
    expect(fills).toHaveLength(1);
    expect(fills[0]!.style.height).toBe('100%');
    expect(amount(/2\s400,00\s₴/)).toHaveClass('text-destructive');
  });
});

describe('CategoryCard — reaction', () => {
  it('glows in its colour when an expense lands, not on first show', () => {
    const props = {
      category: { id: 'c1', name: 'Кафе', icon: '☕', color: '#A855F7', monthlyLimit: null },
      spent: '100',
      pct: 0,
      currency: 'UAH',
    };
    const { container, rerender } = renderWithProviders(<CategoryCard {...props} />);
    const pulse = () => container.querySelector('.motion-safe\\:animate-entity-pulse');
    expect(pulse()).toBeNull();
    rerender(<CategoryCard {...props} spent="150" />);
    expect(pulse()).not.toBeNull();
    expect(container.querySelector('article')!.getAttribute('style')).toContain(
      '--entity: #A855F7',
    );
  });
});

describe('CategoryCard — limits', () => {
  const props = {
    category: { id: 'c1', name: 'Кафе', icon: '☕', color: '#A855F7', monthlyLimit: '1000' },
    currency: 'UAH',
  };
  const badgePops = (c: HTMLElement) => c.querySelector('.motion-safe\\:animate-badge-pop');

  it('moves the bar smoothly', () => {
    renderWithProviders(<CategoryCard {...props} spent="500" pct={50} />);
    expect(screen.getByRole('progressbar').firstElementChild).toHaveClass(
      'motion-safe:transition-[width,background-color]',
    );
  });

  it('pops the over-limit badge when the limit is crossed, not when already over on load', () => {
    const over = renderWithProviders(<CategoryCard {...props} spent="1200" pct={120} />);
    expect(badgePops(over.container)).toBeNull();
    over.unmount();
    const { container, rerender } = renderWithProviders(
      <CategoryCard {...props} spent="900" pct={90} />,
    );
    rerender(<CategoryCard {...props} spent="1200" pct={120} />);
    expect(badgePops(container)).not.toBeNull();
  });
});

describe('CategoryCard — hover', () => {
  it('lifts a little on hover', () => {
    const { container } = renderWithProviders(
      <CategoryCard
        category={{ id: 'c1', name: 'Кафе', icon: '☕', color: null, monthlyLimit: null }}
        spent="0"
        pct={0}
        currency="UAH"
      />,
    );
    expect(container.querySelector('article')).toHaveClass(
      'hover:shadow-card-raised',
      'motion-safe:hover:-translate-y-0.5',
    );
  });
});

describe('CategoryTile — reaction', () => {
  it('glows inside the tile (an outer glow would be clipped by its rounded overflow)', () => {
    const props = {
      category: { id: 'c1', name: 'Кафе', icon: '☕', color: '#A855F7', monthlyLimit: null },
      spent: '100',
      pct: 0,
      currency: 'UAH',
    };
    const { container, rerender } = renderWithProviders(<CategoryTile {...props} />);
    rerender(<CategoryTile {...props} spent="150" />);
    expect(container.querySelector('.motion-safe\\:animate-entity-pulse-inset')).not.toBeNull();
  });
});

describe('CategoryCard — colour edge', () => {
  const base = { spent: '0', pct: 0, currency: 'UAH' };
  it('has an edge in the category colour', () => {
    const { container } = renderWithProviders(
      <CategoryCard
        {...base}
        category={{ id: 'c1', name: 'Кафе', icon: '☕', color: '#A855F7', monthlyLimit: null }}
      />,
    );
    const card = container.querySelector('article')!;
    expect(card).toHaveClass('border-l-4', 'border-l-[color:var(--entity)]');
    expect(card.getAttribute('style')).toContain('--entity: #A855F7');
  });
  it('has no edge without a colour', () => {
    const { container } = renderWithProviders(
      <CategoryCard
        {...base}
        category={{ id: 'c1', name: 'Кафе', icon: '☕', color: null, monthlyLimit: null }}
      />,
    );
    expect(container.querySelector('article')).not.toHaveClass('border-l-4');
  });
});
