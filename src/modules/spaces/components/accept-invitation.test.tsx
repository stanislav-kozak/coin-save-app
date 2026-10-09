import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { AcceptInvitation } from './accept-invitation';

const post = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { POST: (...a: unknown[]) => post(...a) } }));
const replace = vi.fn();
vi.mock('@/shared/i18n/navigation', () => ({
  useRouter: () => ({ replace }),
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const KEY = 'coinsave.pendingInvitation';

beforeEach(() => {
  post.mockReset();
  replace.mockReset();
  localStorage.clear();
});

describe('AcceptInvitation', () => {
  it('joins once and links to the space', async () => {
    post.mockResolvedValue({ data: { spaceId: 'sp9' } });
    renderWithProviders(<AcceptInvitation token="tok" />);
    expect(await screen.findByRole('link', { name: 'Відкрити простір' })).toHaveAttribute(
      'href',
      '/s/sp9',
    );
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('/api/invitations/accept', { body: { token: 'tok' } });
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('keeps the token and asks to sign in when there is no session', async () => {
    post.mockResolvedValue({ error: { statusCode: 401, code: 'HTTP_ERROR', message: 'x' } });
    renderWithProviders(<AcceptInvitation token="tok" />);
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(localStorage.getItem(KEY)).toBe('tok');
  });

  it('explains an invalid invitation and forgets it', async () => {
    post.mockResolvedValue({
      error: { statusCode: 400, code: 'INVITATION_EMAIL_MISMATCH', message: 'x' },
    });
    renderWithProviders(<AcceptInvitation token="tok" />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it('says the link is broken when there is no token', () => {
    renderWithProviders(<AcceptInvitation token={null} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('does not keep the token while the request is in flight', async () => {
    post.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<AcceptInvitation token="tok" />);
    await vi.waitFor(() => expect(post).toHaveBeenCalled());
    expect(localStorage.getItem(KEY)).toBeNull(); // leaving now can't resurrect it later
  });

  it('treats an invitation to a space you are already in as done, not as a failure', async () => {
    post.mockResolvedValue({ error: { statusCode: 409, code: 'ALREADY_MEMBER', message: 'x' } });
    renderWithProviders(<AcceptInvitation token="tok" />);
    expect(await screen.findByText('Ви вже тут — у цьому просторі')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
