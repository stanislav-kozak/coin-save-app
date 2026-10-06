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
});
