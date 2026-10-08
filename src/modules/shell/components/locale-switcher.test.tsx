import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { LocaleSwitcher } from './locale-switcher';

const replace = vi.fn();
const patch = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { PATCH: (...a: unknown[]) => patch(...a) } }));
let pathname = '/s/a';
vi.mock('@/shared/i18n/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => pathname,
}));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    replace.mockReset();
    patch.mockReset();
    pathname = '/s/a';
    window.history.replaceState(null, '', '/');
  });

  it('keeps the query, so an email link (reset password) still works in the other language', async () => {
    pathname = '/reset-password';
    window.history.replaceState(null, '', '/uk/reset-password?token=abc');
    renderWithProviders(<LocaleSwitcher saveToAccount={false} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'English' }));
    expect(replace).toHaveBeenCalledWith('/reset-password?token=abc', { locale: 'en' });
  });

  it('switches to the other language on the same page', async () => {
    renderWithProviders(<LocaleSwitcher />);
    expect(screen.getByRole('button', { name: 'English' })).toHaveTextContent('UA');
    await userEvent.setup().click(screen.getByRole('button', { name: 'English' }));
    expect(replace).toHaveBeenCalledWith('/s/a', { locale: 'en' });
  });

  it('saves the choice to the account (spec §11)', async () => {
    patch.mockResolvedValue({ data: { id: 'u1', email: 'a@b.co', locale: 'en' } });
    renderWithProviders(<LocaleSwitcher />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'English' }));
    await vi.waitFor(() =>
      expect(patch).toHaveBeenCalledWith('/api/users/me', { body: { locale: 'en' } }),
    );
  });

  it('only switches the page when told not to save (signed-out pages)', async () => {
    renderWithProviders(<LocaleSwitcher saveToAccount={false} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'English' }));
    expect(replace).toHaveBeenCalledWith('/s/a', { locale: 'en' });
    expect(patch).not.toHaveBeenCalled();
  });
});
