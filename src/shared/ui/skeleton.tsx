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

/** The main screen's three columns as placeholders, for pages still resolving their space. */
export function PageSkeleton({ label }: { label: string }) {
  return (
    <LoadingRegion
      label={label}
      className="grid flex-1 gap-8 px-4 py-6 md:grid-cols-[1fr_2fr_1fr] md:px-16"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton shape="card" className="h-20" />
        <Skeleton shape="card" className="h-20" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-28" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} shape="card" className="h-30" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    </LoadingRegion>
  );
}
