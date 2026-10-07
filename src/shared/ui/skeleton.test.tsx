import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingRegion, Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('is a hidden placeholder inside a busy region that names what is loading', () => {
    render(
      <LoadingRegion label="Завантаження…">
        <Skeleton shape="card" className="h-20" />
      </LoadingRegion>,
    );
    const region = screen.getByText('Завантаження…').closest('[aria-busy="true"]')!;
    const block = region.querySelector('[data-skeleton="card"]')!;
    expect(block).toHaveAttribute('aria-hidden', 'true');
    expect(block).toHaveClass('motion-safe:animate-pulse');
  });
});
