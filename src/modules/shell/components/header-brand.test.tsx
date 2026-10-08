import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { HeaderBrand } from './header-brand';

vi.mock('@/shared/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

it('links the mark to the space home', () => {
  renderWithProviders(<HeaderBrand spaceId="sp1" />);
  const link = screen.getByRole('link', { name: 'CoinSaveKeeper — на головну' });
  expect(link).toHaveAttribute('href', '/s/sp1');
  expect(link.querySelector('svg')).toBeInTheDocument();
});
