'use client';

import { Toaster as Sonner, toast } from 'sonner';
import { BrandMark } from './brand-mark';

/** One place for app toasts: bottom centre, above the mobile bottom nav, themed by tokens. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      duration={2500}
      offset={{ bottom: 24 }}
      mobileOffset={{ bottom: 88 }}
      toastOptions={{
        classNames: {
          toast:
            'rounded-card border border-border bg-card text-foreground shadow-modal text-body gap-2',
        },
      }}
    />
  );
}

/** A short confirmation after a save (never for errors: those stay in the dialog). */
export function notify(message: string) {
  toast(message, { icon: <BrandMark size={16} /> });
}
