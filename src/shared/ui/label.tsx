import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/utils';

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label className={cn('text-caption font-medium text-muted-foreground', className)} {...props} />
  );
}
