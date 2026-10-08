import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { BrandLoader } from './brand-loader';

it('is a busy status with a spoken label and the looping mark', () => {
  const { container } = render(<BrandLoader label="Завантаження…" />);
  const status = screen.getByRole('status');
  expect(status).toHaveAttribute('aria-busy', 'true');
  expect(status).toHaveTextContent('Завантаження…');
  expect(container.querySelector('[data-part="arc"]')!.getAttribute('class')).toContain(
    'animate-brand-draw-loop',
  );
});
