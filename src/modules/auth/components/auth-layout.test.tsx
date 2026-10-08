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
    // Shown only on desktop with motion allowed; a hide-on-reduce class loses to md:block.
    expect(c.getAttribute('class')).toContain('md:motion-safe:block');
    expect(c.getAttribute('class')).not.toContain('md:block ');
  }
  // Staggered inline (the animate-* shorthand would reset a delay set by a class): never in step.
  const delays = [...coins].map((c) => (c as HTMLElement).style.animationDelay);
  expect(new Set(delays).size).toBe(coins.length);
  expect(screen.getByText('form')).toBeInTheDocument();
});

it('shows the page actions (language, theme) next to the form', () => {
  renderWithProviders(
    <AuthLayout actions={<button type="button">UA</button>}>
      <p>form</p>
    </AuthLayout>,
  );
  expect(screen.getByRole('button', { name: 'UA' })).toBeInTheDocument();
});
