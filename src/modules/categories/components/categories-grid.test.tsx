import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { CategoriesGrid } from './categories-grid';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

beforeEach(() => {
  get.mockReset();
  get.mockImplementation(async (path: string) =>
    path.endsWith('/categories')
      ? {
          data: [
            { id: 'c1', name: 'Кафе', icon: '☕', color: '#A855F7', monthlyLimit: '1000' },
            { id: 'c2', name: 'Таксі', icon: '🚕', color: '#14B8A6', monthlyLimit: null },
          ],
        }
      : {
          data: {
            currency: 'UAH',
            byCategory: [{ categoryId: 'c1', spent: '700', limit: '1000', pct: 70 }],
            expenses: [],
          },
        },
  );
});

describe('CategoriesGrid', () => {
  it('adds expenses still being saved to the category totals and limit percentage', async () => {
    renderWithProviders(
      <CategoriesGrid
        spaceId="sp1"
        pending={[
          { categoryId: 'c1', amount: '150', currency: 'UAH' },
          { categoryId: 'c2', amount: '85', currency: 'UAH' },
        ]}
      />,
    );
    expect((await screen.findAllByText(/850,00\s₴ \/ 1\s000,00\s₴ · 85%/)).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/85,00\s₴/).length).toBeGreaterThan(0);
  });

  it('opens the category editor from a card and the creator from «Додати категорію»', async () => {
    renderWithProviders(<CategoriesGrid spaceId="sp1" />);
    const user = userEvent.setup();
    // Card and circle are both in the DOM (CSS shows one); either opens the editor.
    await user.click((await screen.findAllByRole('button', { name: 'Редагувати: Кафе' }))[0]);
    expect(await screen.findByRole('dialog', { name: 'Категорія' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Додати категорію' }));
    expect(await screen.findByRole('dialog', { name: 'Нова категорія' })).toBeInTheDocument();
  });

  it('derives the percentage from the shown limit, not a stale analytics value', async () => {
    // Right after a limit change the category list is fresh while analytics still has the old pct.
    get.mockImplementation(async (path: string) =>
      path.endsWith('/categories')
        ? { data: [{ id: 'c1', name: 'Кафе', icon: '☕', color: '#A855F7', monthlyLimit: '60' }] }
        : {
            data: {
              currency: 'UAH',
              byCategory: [{ categoryId: 'c1', spent: '88', limit: '50', pct: 176 }],
              expenses: [],
            },
          },
    );
    renderWithProviders(<CategoriesGrid spaceId="sp1" />);
    expect((await screen.findAllByText(/88,00\s₴ \/ 60,00\s₴ · 147%/)).length).toBeGreaterThan(0);
  });
});
