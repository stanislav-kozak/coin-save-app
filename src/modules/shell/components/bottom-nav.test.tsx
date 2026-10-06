import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { BottomNav } from './bottom-nav';

vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/s/sp1/analytics',
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('BottomNav', () => {
  it('links the four sections of the current space and marks the active one', () => {
    renderWithProviders(<BottomNav spaceId="sp1" />);
    expect(screen.getByRole('link', { name: 'Головна' })).toHaveAttribute('href', '/s/sp1');
    expect(screen.getByRole('link', { name: 'Аналітика' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Регулярні' })).toHaveAttribute(
      'href',
      '/s/sp1/recurring',
    );
    expect(screen.getByRole('link', { name: 'Налаштування' })).toHaveAttribute(
      'href',
      '/s/sp1/settings',
    );
  });
});
