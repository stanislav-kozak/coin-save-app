import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { CategoryDialog } from './category-dialog';

const get = vi.fn();
const post = vi.fn();
const patch = vi.fn();
const del = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: {
    GET: (...a: unknown[]) => get(...a),
    POST: (...a: unknown[]) => post(...a),
    PATCH: (...a: unknown[]) => patch(...a),
    DELETE: (...a: unknown[]) => del(...a),
  },
}));

const cafe = {
  id: 'c9',
  name: 'Кафе',
  icon: '☕',
  color: '#ec4999',
  monthlyLimit: '1000',
  sortOrder: 2,
};

beforeEach(() => {
  for (const m of [get, post, patch, del]) m.mockReset();
  get.mockImplementation(async (path: string) =>
    path.endsWith('/analytics')
      ? { data: { currency: 'UAH', byCategory: [], expenses: [] } }
      : { data: [{ ...cafe, color: '#3b82f6' }] },
  );
});

function renderDialog({ category }: { category?: typeof cafe } = {}) {
  renderWithProviders(
    <CategoryDialog spaceId="sp1" open onOpenChange={vi.fn()} category={category} />,
  );
}

describe('CategoryDialog', () => {
  it('creates a category with icon, color and limit', async () => {
    post.mockResolvedValue({ data: { id: 'c10' } });
    renderDialog();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Назва'), 'Спорт');
    await user.click(screen.getByRole('radio', { name: '🏋️' }));
    await user.click(screen.getByRole('radio', { name: 'Індиго' }));
    await user.type(screen.getByLabelText('Місячний ліміт'), '500');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(post).toHaveBeenCalled());
    expect(post.mock.calls[0][1].body).toEqual({
      name: 'Спорт',
      icon: '🏋️',
      color: '#6366f1',
      monthlyLimit: 500,
    });
  });

  it('shows the limit in the space currency', async () => {
    renderDialog({ category: cafe });
    expect(await screen.findByText('UAH')).toBeInTheDocument();
    expect(screen.getByLabelText('Місячний ліміт')).toHaveValue('1000');
  });

  it('removes the limit when the field is cleared', async () => {
    patch.mockResolvedValue({ data: { ...cafe, monthlyLimit: null } });
    renderDialog({ category: cafe });
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('Місячний ліміт'));
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(patch).toHaveBeenCalled());
    expect(patch.mock.calls[0][1].body).toMatchObject({ monthlyLimit: null });
  });

  it('does not send a zero limit', async () => {
    renderDialog({ category: cafe });
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('Місячний ліміт'));
    await user.type(screen.getByLabelText('Місячний ліміт'), '0');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    expect(await screen.findByText('Ліміт має бути більшим за нуль')).toBeInTheDocument();
    expect(patch).not.toHaveBeenCalled();
  });

  it('deletes only after confirming', async () => {
    del.mockResolvedValue({});
    renderDialog({ category: cafe });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Видалити' }));
    expect(screen.getByText(/Витрати залишаться без категорії/)).toBeInTheDocument();
    expect(del).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Видалити категорію' }));
    await vi.waitFor(() =>
      expect(del).toHaveBeenCalledWith('/api/spaces/{spaceId}/categories/{categoryId}', {
        params: { path: { spaceId: 'sp1', categoryId: 'c9' } },
      }),
    );
  });

  it('archives only after confirming', async () => {
    patch.mockResolvedValue({ data: { ...cafe, archived: true } });
    renderDialog({ category: cafe });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Архівувати' }));
    expect(screen.getByText(/історія витрат збережеться/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Архівувати категорію' }));
    await vi.waitFor(() =>
      expect(patch).toHaveBeenCalledWith('/api/spaces/{spaceId}/categories/{categoryId}/archive', {
        params: { path: { spaceId: 'sp1', categoryId: 'c9' } },
      }),
    );
  });

  it('shows a taken name as a localized error', async () => {
    post.mockResolvedValue({
      error: { statusCode: 409, code: 'CATEGORY_NAME_TAKEN', message: 'x' },
    });
    renderDialog();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Назва'), 'Кафе');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Категорія з такою назвою вже існує',
    );
  });

  it('edits a category without an icon or color without inventing them', async () => {
    patch.mockResolvedValue({ data: cafe });
    renderDialog({ category: { ...cafe, icon: null, color: null } as unknown as typeof cafe });
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('Місячний ліміт'));
    await user.type(screen.getByLabelText('Місячний ліміт'), '700');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(patch).toHaveBeenCalled());
    expect(patch.mock.calls[0][1].body).toEqual({ monthlyLimit: 700 });
  });
});
