import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Button } from './button';

it('shows a busy, disabled state with the loading text and the looping mark', () => {
  const { container } = render(
    <Button loading loadingText="Входимо…">
      Увійти
    </Button>,
  );
  const button = screen.getByRole('button', { name: 'Входимо…' });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
  expect(container.querySelector('[data-part="arc"]')).not.toBeNull();
});

it('is a normal button otherwise', () => {
  render(<Button>Увійти</Button>);
  expect(screen.getByRole('button', { name: 'Увійти' })).toBeEnabled();
});
