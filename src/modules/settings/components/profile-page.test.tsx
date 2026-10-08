import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { ProfilePage } from './profile-page';

const get = vi.fn();
const post = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: { GET: (...a: unknown[]) => get(...a), POST: (...a: unknown[]) => post(...a) },
}));
const replace = vi.fn();
vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/s/sp1/profile',
  useRouter: () => ({ replace }),
}));
const setTheme = vi.fn();
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: 'light', setTheme }) }));

beforeEach(() => {
  for (const m of [get, post, replace, setTheme]) m.mockReset();
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
    expect(replace).toHaveBeenCalledWith('/s/sp1/profile', { locale: 'en' });
    await user.click(screen.getByRole('radio', { name: 'Темна' }));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('names the language and theme choices for screen readers', async () => {
    renderWithProviders(<ProfilePage />);
    expect(await screen.findByRole('radiogroup', { name: 'Мова інтерфейсу' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Тема' })).toBeInTheDocument();
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
