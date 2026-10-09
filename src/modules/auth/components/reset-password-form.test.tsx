import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';

const post = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { POST: (...a: unknown[]) => post(...a) } }));
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

beforeEach(() => {
  post.mockReset();
  replace.mockReset();
  push.mockReset();
  sessionStorage.clear();
});
import { ResetPasswordForm } from './reset-password-form';

async function fill(a: string, b: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Новий пароль'), a);
  await user.type(screen.getByLabelText('Підтвердіть пароль'), b);
  await user.click(screen.getByRole('button', { name: 'Зберегти новий пароль' }));
}

describe('ResetPasswordForm', () => {
  it('catches mismatched passwords without calling the API', async () => {
    renderWithProviders(<ResetPasswordForm token="t1" />);
    await fill('12345678', '12345679');
    expect(await screen.findByText('Паролі не збігаються')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('saves and confirms in place, so it also works for a signed-in user', async () => {
    post.mockResolvedValue({ data: { message: 'ok' } });
    renderWithProviders(<ResetPasswordForm token="t1" />);
    await fill('12345678', '12345678');
    expect(await screen.findByRole('heading', { name: 'Пароль змінено' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Увійти' })).toHaveAttribute('href', '/login');
    expect(replace).not.toHaveBeenCalled();
    expect(post).toHaveBeenCalledWith('/api/auth/reset-password', {
      body: { token: 't1', newPassword: '12345678' },
    });
  });

  it('explains an expired link', async () => {
    post.mockResolvedValue({
      error: { statusCode: 400, code: 'INVALID_RESET_TOKEN', message: 'x' },
    });
    renderWithProviders(<ResetPasswordForm token="t1" />);
    await fill('12345678', '12345678');
    expect(await screen.findByRole('alert')).toHaveTextContent('вже не діє');
  });

  it('shows the invalid-link state when the URL has no token', () => {
    renderWithProviders(<ResetPasswordForm token={null} />);
    expect(
      screen.getByText('Посилання для скидання пароля недійсне або застаріло'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Запросити нове посилання' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });
});
