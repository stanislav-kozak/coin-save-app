import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { SettingsPage } from './settings-page';

const api = { GET: vi.fn(), POST: vi.fn(), PATCH: vi.fn(), DELETE: vi.fn() };
vi.mock('@/shared/lib/api-client', () => ({
  api: {
    GET: (...a: unknown[]) => api.GET(...a),
    POST: (...a: unknown[]) => api.POST(...a),
    PATCH: (...a: unknown[]) => api.PATCH(...a),
    DELETE: (...a: unknown[]) => api.DELETE(...a),
  },
}));
const replace = vi.fn();
vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/s/sp1/settings',
  useRouter: () => ({ replace }),
}));
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }) }));

const members = [
  { membershipId: 'm1', userId: 'u1', email: 'owner@x.y', name: 'Станіслав', role: 'OWNER' },
  { membershipId: 'm2', userId: 'u2', email: 'maria@x.y', name: 'Марія', role: 'MEMBER' },
];

function serve(role: 'OWNER' | 'MEMBER', me = role === 'OWNER' ? 'u1' : 'u2') {
  api.GET.mockImplementation(async (path: string) => {
    if (path === '/api/auth/me') return { data: { id: me, email: 'me@x.y', name: null } };
    if (path.endsWith('/members')) return { data: members };
    if (path.endsWith('/invitations'))
      return {
        data: [{ id: 'i1', email: 'olek@x.y', role: 'MEMBER', expiresAt: '2026-10-14T00:00:00Z' }],
      };
    if (path.endsWith('/wallets') || path.endsWith('/categories')) return { data: [] };
    if (path === '/api/spaces')
      return { data: [{ id: 'sp1', name: 'Family', primaryCurrency: 'UAH', role }] };
    return { data: { id: 'sp1', name: 'Family', primaryCurrency: 'UAH', ownerId: 'u1' } };
  });
}

beforeEach(() => {
  for (const m of [...Object.values(api), replace]) m.mockReset();
  for (const m of [api.POST, api.PATCH, api.DELETE]) m.mockResolvedValue({ data: {} });
});

const section = (name: string) =>
  screen.getByRole('heading', { level: 2, name }).closest('section')!;

describe('Settings — space management', () => {
  it('shows the sections in Figma order', async () => {
    serve('OWNER');
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    await screen.findByDisplayValue('Family');
    const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titles).toEqual([
      'Простір',
      'Учасники',
      'Гаманці',
      'Архівовані категорії',
      'Мова та тема',
      'Небезпечна зона',
    ]);
  });

  it('lets the owner rename the space; the currency waits for the backend', async () => {
    serve('OWNER');
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    const user = userEvent.setup();
    const name = await screen.findByDisplayValue('Family');
    expect(screen.getByLabelText('Основна валюта')).toBeDisabled();
    const save = within(section('Простір')).getByRole('button', { name: 'Зберегти зміни' });
    expect(save).toBeDisabled();
    await user.clear(name);
    await user.type(name, 'Сім’я');
    await user.click(save);
    await vi.waitFor(() =>
      expect(api.PATCH).toHaveBeenCalledWith('/api/spaces/{spaceId}', {
        params: { path: { spaceId: 'sp1' } },
        body: { name: 'Сім’я' },
      }),
    );
  });

  it('hides owner-only controls from a member, who can leave instead', async () => {
    serve('MEMBER');
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    expect(await within(section('Простір')).findByText('Family')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Family')).toBeNull();
    await within(section('Учасники')).findByText('Марія');
    expect(screen.queryByRole('button', { name: /^Прибрати:/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Відкликати:/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Видалити простір' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Покинути простір' })).toBeInTheDocument();
  });

  it('removes a member after confirming, and never offers removing yourself', async () => {
    serve('OWNER');
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    const user = userEvent.setup();
    const list = section('Учасники');
    await within(list).findByText('Марія');
    expect(within(list).queryByRole('button', { name: 'Прибрати: Станіслав' })).toBeNull();
    await user.click(within(list).getByRole('button', { name: 'Прибрати: Марія' }));
    const dialog = await screen.findByRole('dialog');
    expect(api.DELETE).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Прибрати' }));
    await vi.waitFor(() =>
      expect(api.DELETE).toHaveBeenCalledWith('/api/spaces/{spaceId}/members/{membershipId}', {
        params: { path: { spaceId: 'sp1', membershipId: 'm2' } },
      }),
    );
  });

  it('invites by email and validates it first', async () => {
    serve('MEMBER');
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    const user = userEvent.setup();
    const email = await screen.findByLabelText('Запросити учасника');
    await user.type(email, 'nope');
    await user.click(screen.getByRole('button', { name: 'Надіслати запрошення' }));
    expect(await screen.findByText('Введіть коректний email')).toBeInTheDocument();
    expect(api.POST).not.toHaveBeenCalled();
    await user.clear(email);
    await user.type(email, 'olena@example.com');
    await user.click(screen.getByRole('button', { name: 'Надіслати запрошення' }));
    expect(
      await screen.findByText('Запрошення надіслано на olena@example.com'),
    ).toBeInTheDocument();
    expect(api.POST).toHaveBeenCalledWith('/api/spaces/{spaceId}/invitations', {
      params: { path: { spaceId: 'sp1' } },
      body: { email: 'olena@example.com' },
    });
  });

  it('deletes the space only with its exact name, then lands elsewhere', async () => {
    serve('OWNER');
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Видалити простір' }));
    const dialog = await screen.findByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Видалити назавжди' });
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByLabelText('Назва простору'), 'Family');
    await user.click(confirm);
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(api.DELETE).toHaveBeenCalledWith('/api/spaces/{spaceId}', {
      params: { path: { spaceId: 'sp1' } },
    });
  });

  it("shows a refusal in the user's language", async () => {
    serve('OWNER');
    api.DELETE.mockResolvedValue({
      error: { statusCode: 403, code: 'FORBIDDEN_NOT_OWNER', message: 'x' },
    });
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    const user = userEvent.setup();
    const list = section('Учасники');
    await user.click(await within(list).findByRole('button', { name: 'Прибрати: Марія' }));
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Прибрати' }),
    );
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('shows a retry instead of an endless skeleton when a section fails to load', async () => {
    serve('OWNER');
    const base = api.GET.getMockImplementation()!;
    api.GET.mockImplementation(async (path: string, ...rest: unknown[]) =>
      path.endsWith('/members')
        ? { error: { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x' } }
        : base(path, ...rest),
    );
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    expect(
      await within(section('Учасники')).findByRole('button', { name: 'Спробувати ще раз' }),
    ).toBeInTheDocument();
  });

  it('says why revoking an invitation failed', async () => {
    serve('OWNER');
    api.DELETE.mockResolvedValue({
      error: { statusCode: 404, code: 'INVITATION_NOT_FOUND', message: 'x' },
    });
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Відкликати: olek@x.y' }));
    expect(await within(section('Учасники')).findByRole('alert')).toBeInTheDocument();
  });

  it('names the language and theme choices for screen readers', async () => {
    serve('OWNER');
    renderWithProviders(<SettingsPage spaceId="sp1" />);
    expect(await screen.findByRole('radiogroup', { name: 'Мова інтерфейсу' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Тема' })).toBeInTheDocument();
  });
});
