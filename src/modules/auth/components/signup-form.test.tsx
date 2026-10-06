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
import { pendingEmail } from '../lib/pending-email';
import { SignupForm } from './signup-form';

async function fill({ name = '', email = 'a@b.co', password = '12345678' } = {}) {
  const user = userEvent.setup();
  if (name) await user.type(screen.getByLabelText("Ім'я"), name);
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Пароль'), password);
  await user.click(screen.getByRole('button', { name: 'Зареєструватися' }));
}

describe('SignupForm', () => {
  it('omits an empty name and goes to check-email with the address remembered', async () => {
    post.mockResolvedValue({ data: {} });
    renderWithProviders(<SignupForm />);
    await fill();
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/check-email'));
    expect(post).toHaveBeenCalledWith('/api/auth/signup', {
      body: { email: 'a@b.co', password: '12345678' },
    });
    expect(pendingEmail.get()).toBe('a@b.co');
  });

  it('sends a trimmed name and email', async () => {
    post.mockResolvedValue({ data: {} });
    renderWithProviders(<SignupForm />);
    await fill({ name: '  Тарас ', email: ' a@b.co ' });
    await vi.waitFor(() =>
      expect(post).toHaveBeenCalledWith('/api/auth/signup', {
        body: { name: 'Тарас', email: 'a@b.co', password: '12345678' },
      }),
    );
  });

  it('requires 8+ characters before calling the API', async () => {
    renderWithProviders(<SignupForm />);
    await fill({ password: '1234567' });
    expect(await screen.findByText('Мінімум 8 символів')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('reports an existing account', async () => {
    post.mockResolvedValue({
      error: { statusCode: 409, code: 'EMAIL_ALREADY_EXISTS', message: 'x' },
    });
    renderWithProviders(<SignupForm />);
    await fill();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Користувач з таким email вже існує',
    );
  });
});
