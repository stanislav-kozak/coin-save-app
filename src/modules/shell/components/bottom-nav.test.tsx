import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ExpenseLauncherProvider } from '@/modules/expenses';
import { renderWithProviders } from '@/test-utils/render';
import { BottomNav } from './bottom-nav';

vi.mock('@/shared/lib/api-client', () => ({
  api: { GET: vi.fn(async () => ({ data: [] })), POST: vi.fn() },
}));
vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/s/sp1/analytics',
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function renderNav() {
  renderWithProviders(
    <ExpenseLauncherProvider spaceId="sp1">
      <BottomNav spaceId="sp1" />
    </ExpenseLauncherProvider>,
  );
}

describe('BottomNav', () => {
  it('links the four sections with icons only and marks the active one', () => {
    renderNav();
    expect(screen.getByRole('button', { name: 'Нова витрата' })).toBeInTheDocument();
    const links = {
      Головна: '/s/sp1',
      Регулярні: '/s/sp1/recurring',
      Аналітика: '/s/sp1/analytics',
      'Налаштування простору': '/s/sp1/settings',
    };
    for (const [name, href] of Object.entries(links)) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('title', name);
      expect(link).toHaveTextContent(/^$/);
      expect(link.querySelector('svg')).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'Аналітика' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Головна' })).not.toHaveAttribute('aria-current');
  });
});
