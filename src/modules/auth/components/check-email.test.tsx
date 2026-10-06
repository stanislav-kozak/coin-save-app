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
import { CheckEmail } from './check-email';

describe('CheckEmail', () => {
  it('shows the remembered address and resends to it', async () => {
    pendingEmail.set('a@b.co');
    post.mockResolvedValue({ data: { message: 'ok' } });
    renderWithProviders(<CheckEmail />);
    expect(screen.getByText('a@b.co')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Надіслати ще раз' }));
    expect(await screen.findByText('Новий лист надіслано')).toBeInTheDocument();
    expect(post).toHaveBeenCalledWith('/api/auth/resend-verification', {
      body: { email: 'a@b.co' },
    });
  });

  it('renders generic copy and no resend button without a remembered address', () => {
    renderWithProviders(<CheckEmail />);
    expect(
      screen.getByText('Ми надіслали лист для підтвердження на вашу пошту'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Надіслати ще раз' })).toBeNull();
  });

  it('survives storage that throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    renderWithProviders(<CheckEmail />);
    expect(screen.getByRole('heading', { name: 'Перевірте пошту' })).toBeInTheDocument();
    spy.mockRestore();
  });

  it('explains rate limiting on resend', async () => {
    pendingEmail.set('a@b.co');
    post.mockResolvedValue({ error: { statusCode: 429, code: 'HTTP_ERROR', message: 'x' } });
    renderWithProviders(<CheckEmail />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Надіслати ще раз' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Забагато спроб');
  });
});
