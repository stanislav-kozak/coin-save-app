'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { categoryDndId, walletDndId } from '../lib/resolve-drop';

/** Wallet card/circle you can pick up (design system §5 "Wallet card — drag state"). */
export function DraggableWallet({ id, children }: { id: string; children: ReactNode }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: walletDndId(id) });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      // touch-none: a long-press must start a drag, not scroll the page (spec §6.6 TouchSensor)
      className={cn(
        'cursor-grab touch-none rounded-card outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        isDragging && 'opacity-40',
      )}
    >
      {children}
    </div>
  );
}

/** Category card/circle you can drop on (design system §5 "accent border + highlighted fill"). */
export function DroppableCategory({
  id,
  isCard,
  children,
}: {
  id: string;
  isCard: boolean;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: categoryDndId(id) });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        isCard ? 'rounded-card' : 'rounded-full',
        isOver && 'bg-primary/5 ring-2 ring-primary',
      )}
    >
      {children}
    </div>
  );
}
