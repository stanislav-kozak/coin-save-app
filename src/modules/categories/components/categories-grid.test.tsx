import { screen } from '@testing-library/react';
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
});
