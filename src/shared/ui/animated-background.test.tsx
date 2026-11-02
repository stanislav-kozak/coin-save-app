import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnimatedBackground } from './animated-background';

const ctx = {
  setTransform: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  fillStyle: '',
};
const raf = vi.fn(() => 1);

const prefers = (reduced: boolean) =>
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q === '(prefers-reduced-motion: reduce)' && reduced,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

beforeEach(() => {
  for (const f of Object.values(ctx)) if (typeof f === 'function') f.mockClear();
  raf.mockClear();
  vi.stubGlobal('requestAnimationFrame', raf);
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('AnimatedBackground', () => {
  it('is decoration only: hidden from assistive tech and never in the way of clicks', () => {
    prefers(false);
    const { container } = render(<AnimatedBackground />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveClass('pointer-events-none', 'fixed', '-z-10');
  });

  it('animates on frames normally', () => {
    prefers(false);
    render(<AnimatedBackground />);
    expect(raf).toHaveBeenCalled();
  });

  it('draws a still grid once with reduced motion, no animation loop', () => {
    prefers(true);
    render(<AnimatedBackground />);
    expect(raf).not.toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
  });

  it('stops drawing when it goes away', () => {
    prefers(false);
    const { unmount } = render(<AnimatedBackground />);
    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('renders nothing animated where canvas is unsupported', () => {
    prefers(false);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(() => render(<AnimatedBackground />)).not.toThrow();
    expect(raf).not.toHaveBeenCalled();
  });
});
