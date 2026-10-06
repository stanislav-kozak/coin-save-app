'use client';

import { X } from 'lucide-react';
import { Dialog as Primitive } from 'radix-ui';
import type { ReactNode } from 'react';

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;

type ContentProps = { title: string; closeLabel: string; children: ReactNode };

/** Design system Modal: header with title and close, body; modal shadow on the surface color. */
export function DialogContent({ title, closeLabel, children }: ContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-50 bg-overlay" />
      <Primitive.Content
        aria-describedby={undefined}
        className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-100 -translate-x-1/2 -translate-y-1/2 rounded-card bg-card p-6 text-card-foreground shadow-modal"
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
