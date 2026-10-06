import type { ReactNode } from 'react';
import { Label } from './label';

type Props = { id: string; label: string; error?: string; children: ReactNode };

/** Label above the control, error below it (design system §5 Input). */
export function FormField({ id, label, error, children }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-caption text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
