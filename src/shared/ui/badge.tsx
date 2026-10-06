import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

// Figma 16:752 (Owner: accent 15% + accent-hover text) / 16:761 (Member: border fill + secondary text).
const TONES = {
  accent: 'bg-primary/15 text-primary-hover',
  neutral: 'bg-border text-muted-foreground',
};

export function Badge({ tone, children }: { tone: keyof typeof TONES; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2.5 text-caption font-medium',
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
