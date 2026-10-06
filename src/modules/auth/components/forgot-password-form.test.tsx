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
import { ForgotPasswordForm } from './forgot-password-form';

describe('ForgotPasswordForm', () => {
  it('sends a trimmed email and shows the neutral confirmation', async () => {
    post.mockResolvedValue({ data: { message: 'ok' } });
    renderWithProviders(<ForgotPasswordForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Email'), ' a@b.co ');
    await user.click(screen.getByRole('button', { name: 'Надіслати посилання' }));
    expect(await screen.findByText(/Якщо акаунт з таким email існує/)).toBeInTheDocument();
    expect(post).toHaveBeenCalledWith('/api/auth/request-password-reset', {
      body: { email: 'a@b.co' },
    });
  });

  it('validates the email before calling the API', async () => {
    renderWithProviders(<ForgotPasswordForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Email'), 'nope');
    await user.click(screen.getByRole('button', { name: 'Надіслати посилання' }));
    expect(await screen.findByText('Введіть коректний email')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });
});
