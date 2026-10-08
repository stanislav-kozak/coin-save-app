import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { HeaderNav } from './header-nav';

vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/s/sp1/recurring',
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('HeaderNav', () => {
  it('links the sections of the current space on desktop and marks the active one', () => {
    renderWithProviders(<HeaderNav spaceId="sp1" />);
    const nav = screen.getByRole('navigation', { name: 'Навігація' });
    expect(nav).toHaveClass('hidden', 'md:flex');
    expect(screen.getByRole('link', { name: 'Головна' })).toHaveAttribute('href', '/s/sp1');
    expect(screen.getByRole('link', { name: 'Регулярні' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Аналітика' })).toHaveAttribute(
      'href',
      '/s/sp1/analytics',
    );
    expect(screen.getByRole('link', { name: 'Головна' })).not.toHaveAttribute('aria-current');
  });
});
