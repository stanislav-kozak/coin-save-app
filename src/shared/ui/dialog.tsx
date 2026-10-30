'use client';

import { X } from 'lucide-react';
import { Dialog as Primitive } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;

type ContentProps = {
  title: string;
  closeLabel: string;
  /** Wider on desktop (e.g. a slide with a screenshot). */
  wide?: boolean;
  children: ReactNode;
};

/**
 * Design system Modal: header with title and close, body; modal shadow on the surface color.
 * A bottom sheet on mobile, centred on desktop; both animate in and out (motion-safe).
 */
export function DialogContent({ title, closeLabel, wide, children }: ContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-50 bg-overlay motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0" />
      <Primitive.Content
        aria-describedby={undefined}
        className={cn(
          'fixed z-50 overflow-y-auto bg-card p-6 text-card-foreground shadow-modal',
          // Mobile: a sheet from the bottom edge, above the home indicator.
          'inset-x-0 bottom-0 max-h-[90dvh] rounded-t-card pb-sheet',
          'motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:slide-in-from-bottom motion-safe:data-[state=open]:duration-300',
          'motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:slide-out-to-bottom motion-safe:data-[state=closed]:duration-200',
          // Desktop: centred, fading in with a slight zoom.
          'md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-[calc(100%-2rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-card md:p-6',
          wide ? 'md:max-w-180' : 'md:max-w-100',
          'md:motion-safe:data-[state=open]:fade-in-0 md:motion-safe:data-[state=open]:zoom-in-95 md:motion-safe:data-[state=open]:slide-in-from-bottom-0 md:motion-safe:data-[state=open]:duration-200',
          'md:motion-safe:data-[state=closed]:fade-out-0 md:motion-safe:data-[state=closed]:zoom-out-95 md:motion-safe:data-[state=closed]:slide-out-to-bottom-0 md:motion-safe:data-[state=closed]:duration-150',
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <Primitive.Title className="text-h2">{title}</Primitive.Title>
          <Primitive.Close
            aria-label={closeLabel}
            className="rounded-control p-1 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <X aria-hidden className="size-5" />
          </Primitive.Close>
        </div>
        {children}
      </Primitive.Content>
    </Primitive.Portal>
  );
}
