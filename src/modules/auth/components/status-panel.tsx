import { CircleAlert, CircleCheck, LoaderCircle, Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

const ICONS = { mail: Mail, success: CircleCheck, error: CircleAlert, pending: LoaderCircle };

type Props = { icon: keyof typeof ICONS; title: string; children?: ReactNode };

/** Centered icon + title layout of the "check your email" frame (Figma 21:955). */
export function StatusPanel({ icon, title, children }: Props) {
  const Icon = ICONS[icon];
  return (
    <section className="flex flex-col items-center gap-3 text-center">
      <span
        className={cn(
          'mb-3 flex size-20 items-center justify-center rounded-full text-primary-foreground',
          icon === 'error' ? 'bg-destructive' : 'bg-primary',
        )}
      >
        <Icon aria-hidden className={cn('size-8', icon === 'pending' && 'animate-spin')} />
      </span>
      <h1 className="text-h1">{title}</h1>
      {children}
    </section>
  );
}
