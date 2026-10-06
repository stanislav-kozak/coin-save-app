import { screen } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
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
import { VerifyEmail } from './verify-email';

describe('VerifyEmail', () => {
  it('posts the token once even under StrictMode', async () => {
    post.mockResolvedValue({ data: { message: 'ok' } });
    renderWithProviders(
      <StrictMode>
        <VerifyEmail token="t1" />
      </StrictMode>,
    );
    expect(await screen.findByRole('heading', { name: 'Email підтверджено' })).toBeInTheDocument();
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('/api/auth/verify-email', { body: { token: 't1' } });
    expect(screen.getByRole('link', { name: 'Увійти' })).toHaveAttribute('href', '/login');
  });

  it('explains an invalid or used link', async () => {
    post.mockResolvedValue({
      error: { statusCode: 400, code: 'INVALID_VERIFICATION_TOKEN', message: 'x' },
    });
    renderWithProviders(<VerifyEmail token="t1" />);
    expect(
      await screen.findByRole('heading', { name: 'Не вдалося підтвердити email' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Посилання для підтвердження недійсне або застаріло'),
    ).toBeInTheDocument();
  });

  it('does not call the API without a token', () => {
    renderWithProviders(<VerifyEmail token={null} />);
    expect(
      screen.getByRole('heading', { name: 'Не вдалося підтвердити email' }),
    ).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });
});
