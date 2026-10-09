import { act, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { WalletCard } from './wallet-card';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const wrap = (ui: ReactNode) => (
  <NextIntlClientProvider locale="uk" messages={{}}>
    {ui}
  </NextIntlClientProvider>
);

it('counts the balance to its new value', () => {
  const wallet = { id: 'w1', name: 'Mono', currency: 'UAH', balance: '1000' };
  const { rerender, container } = render(wrap(<WalletCard wallet={wallet} />));
  rerender(wrap(<WalletCard wallet={{ ...wallet, balance: '900' }} />));
  act(() => vi.advanceTimersByTime(100));
  const animated = container.querySelector('p [aria-hidden="true"]')!;
  expect(animated.textContent).not.toMatch(/^900,00/);
  act(() => vi.advanceTimersByTime(500));
  expect(animated.textContent).toMatch(/^900,00\s₴/);
  expect(screen.getByText(/900,00\s₴/, { selector: '.sr-only' })).toBeInTheDocument();
});

it('lifts a little on hover', () => {
  const { container } = render(
    wrap(<WalletCard wallet={{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '1' }} />),
  );
  expect(container.querySelector('article')).toHaveClass(
    'hover:shadow-card-raised',
    'motion-safe:hover:-translate-y-0.5',
  );
});

it('has an edge in the wallet colour, none without one', () => {
  const { container, rerender } = render(
    wrap(
      <WalletCard
        wallet={{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '1', color: '#3B82F6' }}
      />,
    ),
  );
  expect(container.querySelector('article')).toHaveClass(
    'border-l-4',
    'border-l-[color:var(--entity)]',
  );
  rerender(wrap(<WalletCard wallet={{ id: 'w1', name: 'Mono', currency: 'UAH', balance: '1' }} />));
  expect(container.querySelector('article')).not.toHaveClass('border-l-4');
});
