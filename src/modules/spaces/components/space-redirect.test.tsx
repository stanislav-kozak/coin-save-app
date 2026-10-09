import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { SpaceRedirect } from './space-redirect';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));
const replace = vi.fn();
vi.mock('@/shared/i18n/navigation', () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => {
  get.mockReset();
  replace.mockReset();
  localStorage.clear();
});

describe('SpaceRedirect', () => {
  it('sends a user without spaces to onboarding', async () => {
    get.mockResolvedValue({ data: [] });
    renderWithProviders(<SpaceRedirect />);
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/onboarding'));
  });

  it("opens a section of the remembered space (an email's /recurring link)", async () => {
    localStorage.setItem('coinsave.lastSpaceId', 'b');
    get.mockResolvedValue({ data: [{ id: 'a' }, { id: 'b' }] });
    renderWithProviders(<SpaceRedirect section="recurring" />);
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/s/b/recurring'));
  });

  it('opens the remembered space if it still exists', async () => {
    localStorage.setItem('coinsave.lastSpaceId', 'b');
    get.mockResolvedValue({ data: [{ id: 'a' }, { id: 'b' }] });
    renderWithProviders(<SpaceRedirect />);
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/s/b'));
  });

  it('ignores a remembered space the user lost access to', async () => {
    localStorage.setItem('coinsave.lastSpaceId', 'gone');
    get.mockResolvedValue({ data: [{ id: 'a' }] });
    renderWithProviders(<SpaceRedirect />);
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/s/a'));
  });

  it('explains a failed load and retries instead of a blank page', async () => {
    get
      .mockResolvedValueOnce({ error: { statusCode: 503, code: 'INTERNAL_ERROR', message: 'x' } })
      .mockResolvedValueOnce({ data: [{ id: 'a' }] });
    renderWithProviders(<SpaceRedirect />);
    expect(await screen.findByRole('alert')).toHaveTextContent('У нас щось зламалося');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Спробувати ще раз' }));
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/s/a'));
  });

  it('resumes an invitation accepted before signing in', async () => {
    localStorage.setItem('coinsave.pendingInvitation', 'tok 1');
    get.mockResolvedValue({ data: [{ id: 'a' }] });
    renderWithProviders(<SpaceRedirect />);
    await vi.waitFor(() =>
      expect(replace).toHaveBeenCalledWith('/invitations/accept?token=tok%201'),
    );
    expect(replace).not.toHaveBeenCalledWith('/s/a');
  });

  it('resumes an invitation only once the session is confirmed', async () => {
    localStorage.setItem('coinsave.pendingInvitation', 'tok');
    get.mockResolvedValue({ error: { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x' } });
    renderWithProviders(<SpaceRedirect />);
    await screen.findByRole('alert');
    expect(replace).not.toHaveBeenCalled();
  });
});
