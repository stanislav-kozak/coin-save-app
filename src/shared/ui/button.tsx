import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/utils';

// Design system §5: Primary / Secondary (outline) / Ghost / Danger; M = 40px, S = 32px.
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary: 'border border-primary bg-card text-primary hover:bg-primary/10',
        ghost: 'text-primary hover:bg-primary/10',
        danger: 'bg-destructive text-primary-foreground hover:bg-destructive/90',
      },
      size: {
        m: 'h-10 px-4 text-body',
        s: 'h-8 px-3 text-caption',
      },
    },
    defaultVariants: { variant: 'primary', size: 'm' },
  },
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
