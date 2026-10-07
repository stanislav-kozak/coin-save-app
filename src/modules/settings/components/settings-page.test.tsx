import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { SettingsPage } from './settings-page';

const get = vi.fn();
const patch = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: {
    GET: (...a: unknown[]) => get(...a),
    PATCH: (...a: unknown[]) => patch(...a),
    POST: vi.fn(),
    DELETE: vi.fn(),
  },
}));
const replace = vi.fn();
vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/s/sp1/settings',
  useRouter: () => ({ replace }),
}));
const setTheme = vi.fn();
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: 'light', setTheme }) }));

const wallets = [
  {
    id: 'w1',
    name: 'Mono',
    currency: 'UAH',
    balance: '1',
    initialBalance: '0',
    color: null,
    archived: false,
  },
  {
    id: 'w2',
    name: 'Стара картка',
    currency: 'UAH',
    balance: '0',
    initialBalance: '0',
    color: null,
    archived: true,
  },
];
const categories = [
  {
    id: 'c1',
    name: 'Кафе',
    icon: '☕',
    color: null,
    monthlyLimit: null,
    sortOrder: 0,
    archived: false,
  },
  {
    id: 'c2',
    name: 'Спорт',
    icon: '🏋️',
    color: null,
    monthlyLimit: null,
    sortOrder: 1,
    archived: true,
  },
];

beforeEach(() => {
  for (const m of [get, patch, replace, setTheme]) m.mockReset();
  get.mockImplementation(async (path: string) => {
    if (path.endsWith('/wallets')) return { data: wallets };
    if (path.endsWith('/categories')) return { data: categories };
    if (path.endsWith('/members')) return { data: [] };
    if (path.endsWith('/invitations')) return { data: [] };
    if (path === '/api/auth/me') return { data: { id: 'u1', email: 'me@x.y', name: 'Я' } };
    if (path === '/api/spaces')
      return { data: [{ id: 'sp1', name: 'Тест', primaryCurrency: 'UAH', role: 'OWNER' }] };
    return { data: { id: 'sp1', name: 'Тест', primaryCurrency: 'UAH', ownerId: 'u1' } };
  });
  patch.mockResolvedValue({ data: {} });
});

describe('SettingsPage', () => {
  it('has the wallets, archived categories and preferences sections', async () => {
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Налаштування' }),
    ).toBeInTheDocument();
    for (const name of ['Гаманці', 'Архівовані категорії', 'Мова та тема']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });

  it('switches the language on the same page and the theme', async () => {
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('radio', { name: 'EN' }));
    expect(replace).toHaveBeenCalledWith('/s/sp1/settings', { locale: 'en' });
    await user.click(screen.getByRole('radio', { name: 'Темна' }));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('restores an archived category and an archived wallet', async () => {
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    const user = userEvent.setup();
    const cats = screen
      .getByRole('heading', { level: 2, name: 'Архівовані категорії' })
      .closest('section')!;
    await user.click(await within(cats).findByRole('button', { name: 'Відновити: Спорт' }));
    expect(patch).toHaveBeenCalledWith('/api/spaces/{spaceId}/categories/{categoryId}/unarchive', {
      params: { path: { spaceId: 'sp1', categoryId: 'c2' } },
    });
    const ws = screen.getByRole('heading', { level: 2, name: 'Гаманці' }).closest('section')!;
    await user.click(await within(ws).findByRole('button', { name: 'Відновити: Стара картка' }));
    expect(patch).toHaveBeenCalledWith('/api/spaces/{spaceId}/wallets/{walletId}/unarchive', {
      params: { path: { spaceId: 'sp1', walletId: 'w2' } },
    });
    await user.click(within(ws).getByRole('button', { name: 'Редагувати: Mono' }));
    expect(await screen.findByRole('dialog', { name: 'Гаманець' })).toBeInTheDocument();
  });

  it('says why restoring failed', async () => {
    patch.mockResolvedValue({
      error: { statusCode: 404, code: 'CATEGORY_NOT_FOUND', message: 'x' },
    });
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    const cats = (
      await screen.findByRole('heading', { level: 2, name: 'Архівовані категорії' })
    ).closest('section')!;
    await userEvent
      .setup()
      .click(await within(cats).findByRole('button', { name: 'Відновити: Спорт' }));
    expect(await within(cats).findByRole('alert')).toBeInTheDocument();
  });
});
