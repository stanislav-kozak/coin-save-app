import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { UserMenu } from './user-menu';

const get = vi.fn();
const post = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: { GET: (...a: unknown[]) => get(...a), POST: (...a: unknown[]) => post(...a) },
}));
vi.mock('@/shared/i18n/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/s/a',
}));
const assign = vi.fn();

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  assign.mockReset();
  vi.stubGlobal('location', { ...window.location, assign, pathname: '/uk/s/a' });
  get.mockResolvedValue({ data: { id: 'u1', email: 'kozak@b.co', name: 'Станіслав Козак' } });
});
afterEach(() => {
  vi.unstubAllGlobals();
});

async function openMenu() {
  const user = userEvent.setup();
  const trigger = await screen.findByRole('button', { name: 'Меню користувача' });
  await vi.waitFor(() => expect(trigger).toHaveTextContent('СК'));
  await user.click(trigger);
  return user;
}

describe('UserMenu', () => {
  it('shows initials and the email', async () => {
    renderWithProviders(<UserMenu />);
    await openMenu();
    expect(await screen.findByText('kozak@b.co')).toBeInTheDocument();
  });

  it('signs out: calls logout and reloads into the login page', async () => {
    post.mockResolvedValue({ data: { message: 'ok' } });
    renderWithProviders(<UserMenu />);
    const user = await openMenu();
    await user.click(await screen.findByRole('menuitem', { name: 'Вийти' }));
    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith('/uk/login'));
    expect(post).toHaveBeenCalledWith('/api/auth/logout');
  });

  it('still leaves when the logout request fails', async () => {
    post.mockRejectedValue(new TypeError('Failed to fetch'));
    renderWithProviders(<UserMenu />);
    const user = await openMenu();
    await user.click(await screen.findByRole('menuitem', { name: 'Вийти' }));
    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith('/uk/login'));
  });
});
