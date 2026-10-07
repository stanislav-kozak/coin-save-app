import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

/** A Settings card (Figma 16:722): titled section; `danger` for the destructive zone. */
export function SettingsSection({
  id,
  title,
  tone,
  children,
}: {
  id: string;
  title: string;
  tone?: 'danger';
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn(
        'flex flex-col gap-4 rounded-card border bg-card p-4 shadow-card md:p-6',
        tone === 'danger' ? 'border-destructive/40' : 'border-border',
      )}
    >
      <h2 id={`${id}-title`} className={cn('text-h2', tone === 'danger' && 'text-destructive')}>
        {title}
      </h2>
      {children}
    </section>
  );
}
