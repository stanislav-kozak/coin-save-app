import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { BrandMark } from './brand-mark';
import { Logo } from './logo';

describe('BrandMark', () => {
  it('is decorative and fully drawn when still', () => {
    const { container } = render(<BrandMark size={28} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '28');
    const arc = svg.querySelector('[data-part="arc"]')!;
    expect(arc).toHaveAttribute('stroke-dashoffset', '38'); // the final frame, also under reduced motion
    expect(arc.getAttribute('class')).not.toMatch(/animate/);
  });

  it('animates only when motion is allowed', () => {
    const { container } = render(<BrandMark motion="intro" />);
    expect(container.querySelector('[data-part="arc"]')!.getAttribute('class')).toContain(
      'motion-safe:animate-brand-draw',
    );
    expect(container.querySelector('[data-part="coin"]')!.getAttribute('class')).toContain(
      'motion-safe:animate-brand-pop',
    );
  });

  it('loops for loading', () => {
    const { container } = render(<BrandMark motion="loop" />);
    expect(container.querySelector('[data-part="arc"]')!.getAttribute('class')).toContain(
      'motion-safe:animate-brand-draw-loop',
    );
  });

  it('turns white on the coral panel', () => {
    const { container } = render(<BrandMark tone="on-primary" />);
    expect(container.querySelector('[data-part="arc"]')!.getAttribute('class')).toContain(
      'stroke-primary-foreground',
    );
  });
});

describe('Logo', () => {
  it('reads as one name for assistive tech', () => {
    renderWithProviders(<Logo />);
    expect(screen.getByRole('img', { name: 'CoinSaveKeeper' })).toBeInTheDocument();
    expect(screen.getByText('KEEPER')).toBeInTheDocument();
  });
});
