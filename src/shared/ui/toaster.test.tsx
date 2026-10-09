import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { Toaster } from './toaster';

const props = vi.fn();
vi.mock('sonner', () => ({
  Toaster: (p: unknown) => {
    props(p);
    return null;
  },
  toast: vi.fn(),
}));
let desktop = false;
vi.mock('@/shared/hooks/use-is-desktop', () => ({ useIsDesktop: () => desktop }));
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: 'dark' }) }));

beforeEach(() => props.mockReset());

it('is styled by our tokens and follows the theme (sonner styles would win otherwise)', () => {
  render(<Toaster />);
  const p = props.mock.calls[0]![0];
  expect(p.theme).toBe('dark');
  expect(p.toastOptions.unstyled).toBe(true);
  expect(p.toastOptions.classNames.toast).toContain('bg-card');
});

it('sits above the bottom nav (and the home indicator) wherever the nav shows', () => {
  desktop = false;
  render(<Toaster />);
  const p = props.mock.calls[0]![0];
  expect(p.offset.bottom).toBe('calc(96px + env(safe-area-inset-bottom))');
  expect(p.mobileOffset.bottom).toBe('calc(96px + env(safe-area-inset-bottom))');
  desktop = true;
  render(<Toaster />);
  expect(props.mock.calls[1]![0].offset.bottom).toBe(24);
});
