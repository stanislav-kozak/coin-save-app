import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { AuthLayout } from './auth-layout';

it('shows the animated logo, the tagline and decorative coins that hide for reduced motion', () => {
  const { container } = renderWithProviders(
    <AuthLayout>
      <p>form</p>
    </AuthLayout>,
  );
  expect(screen.getByRole('img', { name: 'CoinSaveKeeper' })).toBeInTheDocument();
  expect(container.querySelector('[data-part="arc"]')!.getAttribute('class')).toContain(
    'animate-brand-draw',
  );
  const coins = container.querySelectorAll('[data-coin]');
  expect(coins.length).toBeGreaterThanOrEqual(3);
  for (const c of coins) {
    expect(c).toHaveAttribute('aria-hidden');
    expect(c.getAttribute('class')).toContain('motion-reduce:hidden');
  }
  expect(screen.getByText('form')).toBeInTheDocument();
});
