import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
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

const spaces = [
  { id: 'a', name: 'Family', role: 'OWNER' },
  { id: 'b', name: 'Startup', role: 'MEMBER' },
];

beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: spaces });
});

describe('SpaceSwitcher', () => {
  it('shows the current space name on the trigger', async () => {
    renderWithProviders(<SpaceSwitcher currentSpaceId="a" />);
    expect(await screen.findByRole('button', { name: /Family/ })).toBeInTheDocument();
  });

  it('lists spaces with roles, marks the current one and links to each', async () => {
    renderWithProviders(<SpaceSwitcher currentSpaceId="a" />);
    await userEvent.setup().click(await screen.findByRole('button', { name: /Family/ }));
    const family = await screen.findByRole('menuitem', { name: /^Family/ });
    expect(family).toHaveAttribute('aria-current', 'true');
    expect(family).toHaveTextContent('Власник');
    const startup = screen.getByRole('menuitem', { name: /^Startup/ });
    expect(startup).toHaveAttribute('href', '/s/b');
    expect(startup).toHaveTextContent('Учасник');
    expect(screen.getByRole('menuitem', { name: /Створити новий простір/ })).toHaveAttribute(
      'href',
      '/onboarding',
    );
  });

  it("links to each space's settings with a gear next to it", async () => {
    renderWithProviders(<SpaceSwitcher currentSpaceId="a" />);
    await userEvent.setup().click(await screen.findByRole('button', { name: /Family/ }));
    for (const [name, id] of [
      ['Family', 'a'],
      ['Startup', 'b'],
    ]) {
      const gear = await screen.findByRole('menuitem', { name: `Налаштування простору ${name}` });
      expect(gear).toHaveAttribute('href', `/s/${id}/settings`);
      expect(gear).toHaveAttribute('title', 'Налаштування простору');
      expect(gear.querySelector('svg')).toBeInTheDocument();
    }
  });

  it('offers to switch instead of a blank trigger when the current space is not yours', async () => {
    renderWithProviders(<SpaceSwitcher currentSpaceId="foreign" />);
    expect(await screen.findByRole('button', { name: /Перемкнути простір/ })).toBeInTheDocument();
  });

  it('still offers a way out when the list fails to load', async () => {
    get.mockResolvedValue({ error: { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x' } });
    renderWithProviders(<SpaceSwitcher currentSpaceId="a" />);
    expect(await screen.findByText('Перемкнути простір')).toBeInTheDocument();
  });
});
