import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type Shape = 'card' | 'circle' | 'row' | 'line';

/** A placeholder block in the shape of what is loading (sized by `className`). */
export function Skeleton({ shape = 'line', className }: { shape?: Shape; className?: string }) {
  return (
    <span
      aria-hidden
      data-skeleton={shape}
      className={cn(
        'block bg-border motion-safe:animate-pulse',
        shape === 'card' && 'rounded-card',
        shape === 'circle' && 'rounded-full',
        (shape === 'line' || shape === 'row') && 'rounded-control',
        className,
      )}
    />
  );
}

/** Marks a loading area for assistive tech: busy, with a spoken label instead of the blocks. */
export function LoadingRegion({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
