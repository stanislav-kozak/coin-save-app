import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { ProfilePage } from './profile-page';

const get = vi.fn();
const post = vi.fn();
const patch = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: {
    GET: (...a: unknown[]) => get(...a),
    POST: (...a: unknown[]) => post(...a),
    PATCH: (...a: unknown[]) => patch(...a),
  },
}));
const replace = vi.fn();
vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/s/sp1/profile',
  useRouter: () => ({ replace }),
}));
const setTheme = vi.fn();
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: 'light', setTheme }) }));

beforeEach(() => {
  for (const m of [get, post, patch, replace, setTheme]) m.mockReset();
  patch.mockImplementation(async (_path: string, { body }: { body: object }) => ({
    data: { id: 'u1', email: 'me@x.y', name: 'Станіслав Козак', locale: 'uk', ...body },
  }));
  get.mockResolvedValue({
    data: { id: 'u1', email: 'me@x.y', name: 'Станіслав Козак', locale: 'uk' },
  });
  post.mockResolvedValue({ data: { message: 'ok' } });
});

describe('ProfilePage', () => {
  it('shows the account with its email, and the language and theme', async () => {
    renderWithProviders(<ProfilePage />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Профіль' })).toBeInTheDocument();
    expect(await screen.findByText('me@x.y')).toBeInTheDocument();
    expect(screen.getByText('СК')).toBeInTheDocument();
    for (const name of ['Особисті дані', 'Мова та тема', 'Безпека']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });

  it('switches the language on the same page and the theme', async () => {
    renderWithProviders(<ProfilePage />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('radio', { name: 'EN' }));
    await vi.waitFor(() =>
      expect(replace).toHaveBeenCalledWith('/s/sp1/profile', { locale: 'en' }),
    );
    await user.click(screen.getByRole('radio', { name: 'Темна' }));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('names the language and theme choices for screen readers', async () => {
    renderWithProviders(<ProfilePage />);
    expect(await screen.findByRole('radiogroup', { name: 'Мова інтерфейсу' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Тема' })).toBeInTheDocument();
  });

  it('renames the user, and the initials follow', async () => {
    renderWithProviders(<ProfilePage />);
    const user = userEvent.setup();
    const name = await screen.findByLabelText("Ім'я");
    expect(name).toHaveValue('Станіслав Козак');
    expect(screen.getByRole('button', { name: 'Зберегти' })).toBeDisabled();
    await user.clear(name);
    await user.type(name, '  Олена Пчілка ');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    await vi.waitFor(() =>
      expect(patch).toHaveBeenCalledWith('/api/users/me', { body: { name: 'Олена Пчілка' } }),
    );
    expect(await screen.findByText('ОП')).toBeInTheDocument();
  });

  it('refuses a blank name', async () => {
    renderWithProviders(<ProfilePage />);
    const user = userEvent.setup();
    const name = await screen.findByLabelText("Ім'я");
    await user.clear(name);
    await user.type(name, '   ');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));
    expect(await screen.findByText("Вкажіть ім'я")).toBeInTheDocument();
    expect(patch).not.toHaveBeenCalled();
  });

  it('saves the chosen language to the account', async () => {
    renderWithProviders(<ProfilePage />);
    await userEvent.setup().click(await screen.findByRole('radio', { name: 'EN' }));
    await vi.waitFor(() =>
      expect(patch).toHaveBeenCalledWith('/api/users/me', { body: { locale: 'en' } }),
    );
    expect(patch).toHaveBeenCalledTimes(1);
    await vi.waitFor(() =>
      expect(replace).toHaveBeenCalledWith('/s/sp1/profile', { locale: 'en' }),
    );
  });

  it('says when the language could not be saved to the account', async () => {
    patch.mockResolvedValue({ error: { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x' } });
    renderWithProviders(<ProfilePage />);
    await userEvent.setup().click(await screen.findByRole('radio', { name: 'EN' }));
    const preferences = screen
      .getByRole('heading', { level: 2, name: 'Мова та тема' })
      .closest('section')!;
    expect(await within(preferences).findByRole('alert')).not.toHaveTextContent(/^$/);
    // Switching remounts the page and would take the message with it: stay until it's saved.
    expect(replace).not.toHaveBeenCalled();
  });

  it('sends a password change link to the own email', async () => {
    renderWithProviders(<ProfilePage />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Змінити пароль' }));
    expect(post).toHaveBeenCalledWith('/api/auth/request-password-reset', {
      body: { email: 'me@x.y' },
    });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Ми надіслали посилання для зміни пароля на me@x.y',
    );
  });

  it('says why the link was not sent', async () => {
    post.mockResolvedValue({
      error: { statusCode: 429, code: 'TOO_MANY_REQUESTS', message: 'x' },
    });
    renderWithProviders(<ProfilePage />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Змінити пароль' }));
    expect(await screen.findByRole('alert')).not.toHaveTextContent(/^$/);
  });
});
