'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, toast } from 'sonner';
import { useIsDesktop } from '@/shared/hooks/use-is-desktop';
import { BrandMark } from './brand-mark';

// Above the bottom nav and the "+" button, plus the home indicator; the nav shows below `md`, which
// is wider than sonner's own mobile breakpoint, so the offset follows our breakpoint instead.
const ABOVE_NAV = 'calc(96px + env(safe-area-inset-bottom))';

/** One place for app toasts: bottom centre, styled by our tokens (sonner's own styles are off). */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  const desktop = useIsDesktop();
  const bottom = desktop ? 24 : ABOVE_NAV;
  return (
    <Sonner
      position="bottom-center"
      duration={2500}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      offset={{ bottom }}
      mobileOffset={{ bottom }}
      toastOptions={{
        // Unstyled: sonner's unlayered CSS would otherwise beat every Tailwind utility.
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-center gap-2 rounded-card border border-border bg-card px-4 py-3 font-sans text-body text-foreground shadow-modal',
        },
      }}
    />
  );
}

/** A short confirmation after a save (never for errors: those stay in the dialog). */
export function notify(message: string) {
  toast(message, { icon: <BrandMark size={16} /> });
}
