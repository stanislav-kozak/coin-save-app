import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

/** Figma 22:985 "Empty States". */
export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-border bg-card p-6 text-center shadow-card">
      <span
        aria-hidden
        className="mb-2 flex size-10 items-center justify-center rounded-full bg-border text-muted-foreground"
      >
        <Plus className="size-5" />
      </span>
      <p className="text-body font-medium">{title}</p>
      <p className="text-caption text-muted-foreground">{text}</p>
      {action ? <div className="mt-3 w-full">{action}</div> : null}
    </div>
  );
}
