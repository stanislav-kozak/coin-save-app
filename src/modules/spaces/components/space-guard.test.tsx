import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { SpaceGuard } from './space-guard';
import { SpaceSwitcher } from './space-switcher';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));
vi.mock('@/shared/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  get.mockReset();
  localStorage.clear();
});

describe('SpaceGuard', () => {
  it('renders the space and remembers it', async () => {
    get.mockResolvedValue({ data: { id: 'sp1', name: 'Family' } });
    renderWithProviders(
      <SpaceGuard spaceId="sp1">
        <p>inside</p>
      </SpaceGuard>,
    );
    expect(await screen.findByText('inside')).toBeInTheDocument();
    expect(localStorage.getItem('coinsave.lastSpaceId')).toBe('sp1');
  });

  it.each([
    [403, 'FORBIDDEN_NOT_MEMBER'],
    [404, 'SPACE_NOT_FOUND'],
  ])('explains a %s and links back to the landing page', async (statusCode, code) => {
    get.mockResolvedValue({ error: { statusCode, code, message: 'x' } });
    renderWithProviders(
      <SpaceGuard spaceId="nope">
        <p>inside</p>
      </SpaceGuard>,
    );
    expect(await screen.findByRole('heading', { name: 'Простір недоступний' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'До моїх просторів' })).toHaveAttribute('href', '/');
    expect(screen.queryByText('inside')).toBeNull();
    expect(localStorage.getItem('coinsave.lastSpaceId')).toBeNull();
  });

  it('forgets a lost space so landing and the switcher stop offering it', async () => {
    localStorage.setItem('coinsave.lastSpaceId', 'gone');
    let listCalls = 0;
    get.mockImplementation(async (path: string) => {
      if (path === '/api/spaces') {
        listCalls += 1;
        return { data: listCalls === 1 ? [{ id: 'gone', name: 'Old', role: 'MEMBER' }] : [] };
      }
      return { error: { statusCode: 403, code: 'FORBIDDEN_NOT_MEMBER', message: 'x' } };
    });
    renderWithProviders(
      <>
        <SpaceSwitcher currentSpaceId="gone" />
        <SpaceGuard spaceId="gone">
          <p>inside</p>
        </SpaceGuard>
      </>,
    );
    expect(await screen.findByRole('heading', { name: 'Простір недоступний' })).toBeInTheDocument();
    await vi.waitFor(() => expect(listCalls).toBe(2)); // the cached list was refreshed
    expect(localStorage.getItem('coinsave.lastSpaceId')).toBeNull();
  });

  it('shows the brand loader while the space loads', () => {
    get.mockReturnValue(new Promise(() => {}));
    const { container } = renderWithProviders(
      <SpaceGuard spaceId="sp1">
        <p>content</p>
      </SpaceGuard>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Завантаження…');
    expect(container.querySelector('[data-skeleton]')).toBeNull();
    expect(screen.queryByText('content')).toBeNull();
  });
});
