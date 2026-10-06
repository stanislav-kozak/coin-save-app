import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('links the four sections of the current space and marks the active one', () => {
    renderNav();
    expect(screen.getByRole('button', { name: 'Нова витрата' })).toBeInTheDocument();
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

  it('shows only the icon when a label is too wide for its column, keeping it for screen readers', () => {
    // jsdom has no layout: a 78px column (390px / 5) and text widths per label.
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(78);
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.textContent === 'Налаштування' ? 96 : 60;
    });
    renderNav();
    const settings = screen.getByRole('link', { name: 'Налаштування' });
    expect(screen.getByText('Налаштування')).toHaveClass('sr-only');
    expect(settings.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Головна')).not.toHaveClass('sr-only');
  });
});
