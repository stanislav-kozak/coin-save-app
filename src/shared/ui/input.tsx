import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/utils';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-control border border-input bg-card px-3 text-body text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary aria-invalid:border-destructive disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
