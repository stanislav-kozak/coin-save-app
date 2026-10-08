import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { pendingEmail } from '../lib/pending-email';
import { LoginForm } from './login-form';

const post = vi.fn();
const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: { POST: (...a: unknown[]) => post(...a), GET: (...a: unknown[]) => get(...a) },
}));
const replace = vi.fn();
const push = vi.fn();
vi.mock('@/shared/i18n/navigation', () => ({
  useRouter: () => ({ replace, push }),
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={String(href)} {...rest}>
      {children}
    </a>
  ),
}));

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Пароль'), password);
  await user.click(screen.getByRole('button', { name: 'Увійти' }));
}

describe('LoginForm', () => {
  beforeEach(() => {
    post.mockReset();
    get.mockReset();
    get.mockResolvedValue({ data: { id: 'u1', email: 'a@b.co', locale: 'uk' } });
    replace.mockReset();
    push.mockReset();
    sessionStorage.clear();
  });

  it('validates before calling the API', async () => {
    renderWithProviders(<LoginForm />);
    await fillAndSubmit('nope', 'secret');
    expect(await screen.findByText('Введіть коректний email')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('sends a trimmed email and goes to the app on success', async () => {
    post.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.co' } } });
    renderWithProviders(<LoginForm />);
    await fillAndSubmit('  a@b.co ', 'secret');
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(post).toHaveBeenCalledWith('/api/auth/login', {
      body: { email: 'a@b.co', password: 'secret' },
    });
  });

  it("opens the app in the account's saved language", async () => {
    post.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.co' } } });
    get.mockResolvedValue({ data: { id: 'u1', email: 'a@b.co', locale: 'en' } });
    renderWithProviders(<LoginForm />);
    await fillAndSubmit('a@b.co', 'secret');
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/', { locale: 'en' }));
  });

  it('enters the app when the saved language cannot be read', async () => {
    post.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.co' } } });
    get.mockResolvedValue({ error: { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x' } });
    renderWithProviders(<LoginForm />);
    await fillAndSubmit('a@b.co', 'secret');
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(get).toHaveBeenCalledTimes(1); // no retry delay before entering
  });

  it('stays busy until it has moved on, so a second click signs in only once', async () => {
    post.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.co' } } });
    get.mockReturnValue(new Promise(() => {})); // the saved language is still loading
    renderWithProviders(<LoginForm />);
    await fillAndSubmit('a@b.co', 'secret');
    await vi.waitFor(() => expect(get).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Входимо…' })).toBeDisabled();
  });

  it('says it is signing in while the request runs', async () => {
    post.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<LoginForm />);
    await fillAndSubmit('a@b.co', 'secret');
    expect(await screen.findByRole('button', { name: 'Входимо…' })).toBeDisabled();
  });

  it('shows wrong credentials in the current language', async () => {
    post.mockResolvedValue({
      error: { statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'x' },
    });
    renderWithProviders(<LoginForm />);
    await fillAndSubmit('a@b.co', 'bad');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Email або пароль не підходять');
    // The way out sits right under the error.
    expect(within(alert).getByRole('link', { name: 'Відновити пароль' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('sends an unverified user to check their email', async () => {
    post.mockResolvedValue({
      error: { statusCode: 403, code: 'EMAIL_NOT_VERIFIED', message: 'x' },
    });
    renderWithProviders(<LoginForm />);
    await fillAndSubmit('a@b.co', 'secret');
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/check-email'));
    expect(pendingEmail.get()).toBe('a@b.co');
  });

  it('explains rate limiting', async () => {
    post.mockResolvedValue({ error: { statusCode: 429, code: 'HTTP_ERROR', message: 'x' } });
    renderWithProviders(<LoginForm />);
    await fillAndSubmit('a@b.co', 'secret');
    expect(await screen.findByRole('alert')).toHaveTextContent('Забагато спроб');
  });
});
