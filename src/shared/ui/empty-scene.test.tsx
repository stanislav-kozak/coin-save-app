import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { EmptyScene } from './empty-scene';

it.each(['wallet', 'expenses', 'chart', 'repeat'] as const)(
  'the %s scene has its text, a decorative picture built from the mark and the action',
  (scene) => {
    const { container } = render(
      <EmptyScene scene={scene} title="T" text="X" action={<button type="button">Go</button>} />,
    );
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('[data-part="arc"]')).not.toBeNull();
    expect(container.querySelector('.motion-safe\\:animate-float')).not.toBeNull();
  },
);
