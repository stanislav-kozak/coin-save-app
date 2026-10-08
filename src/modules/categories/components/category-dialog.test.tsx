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
  currency: null as 'EUR' | null,
};

beforeEach(() => {
  for (const m of [get, post, patch, del]) m.mockReset();
  get.mockImplementation(async (path: string) =>
    path.endsWith('/analytics')
      ? { data: { currency: 'UAH', byCategory: [], expenses: [] } }
      : path === '/api/currencies/rate'
        ? { data: { from: 'UAH', to: 'EUR', rate: '0.0241', date: '2026-10-08' } }
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

  it('creates a category with its own currency', async () => {
    post.mockResolvedValue({ data: { id: 'c10' } });
    renderDialog();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Назва'), 'Подорож');
    await user.selectOptions(await screen.findByLabelText('Валюта ліміту'), 'EUR');
    expect(screen.getByText('EUR')).toBeInTheDocument(); // the limit badge follows
    await user.type(screen.getByLabelText('Місячний ліміт'), '500');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(post).toHaveBeenCalled());
    expect(post.mock.calls[0][1].body).toMatchObject({ currency: 'EUR', monthlyLimit: 500 });
  });

  it("converts an untouched limit to the new currency at today's rate", async () => {
    patch.mockResolvedValue({ data: { ...cafe, currency: 'EUR', monthlyLimit: '24' } });
    renderDialog({ category: cafe });
    const user = userEvent.setup();
    await user.selectOptions(await screen.findByLabelText('Валюта ліміту'), 'EUR');
    // 1000 ₴ × 0.0241, rounded to whole units like the server
    expect(await screen.findByText(/≈\s?24,00\s€/)).toBeInTheDocument();
    // The field still holds the old limit, so its badge keeps the old currency until it's typed over.
    expect(screen.getByText('UAH')).toBeInTheDocument();
    expect(screen.queryByText('EUR')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(patch).toHaveBeenCalled());
    expect(patch.mock.calls[0][1].body).toEqual({ currency: 'EUR' });
  });

  it('takes a limit typed together with a new currency as is', async () => {
    patch.mockResolvedValue({ data: { ...cafe, currency: 'EUR', monthlyLimit: '500' } });
    renderDialog({ category: cafe });
    const user = userEvent.setup();
    await user.selectOptions(await screen.findByLabelText('Валюта ліміту'), 'EUR');
    await user.clear(screen.getByLabelText('Місячний ліміт'));
    await user.type(screen.getByLabelText('Місячний ліміт'), '500');
    expect(screen.queryByText(/≈/)).toBeNull();
    expect(screen.getByText('EUR')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(patch).toHaveBeenCalled());
    expect(patch.mock.calls[0][1].body).toEqual({ currency: 'EUR', monthlyLimit: 500 });
  });

  it('goes back to the space currency', async () => {
    patch.mockResolvedValue({ data: cafe });
    renderDialog({ category: { ...cafe, currency: 'EUR' } });
    const user = userEvent.setup();
    const select = await screen.findByLabelText('Валюта ліміту');
    expect(select).toHaveValue('EUR');
    await screen.findByRole('option', { name: 'Як у простору (UAH)' }); // once the space currency is known
    await user.selectOptions(select, 'Як у простору (UAH)');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() => expect(patch).toHaveBeenCalled());
    expect(patch.mock.calls[0][1].body).toEqual({ currency: null });
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

  it('forgets a failed archive once the confirmation is cancelled', async () => {
    patch.mockResolvedValue({
      error: { statusCode: 404, code: 'CATEGORY_NOT_FOUND', message: 'x' },
    });
    renderDialog({ category: cafe });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Архівувати' }));
    await user.click(screen.getByRole('button', { name: 'Архівувати категорію' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Скасувати' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
