'use client';

import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DragHandleProps } from '@/modules/categories';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { categoryDndId, walletDndId } from '../lib/resolve-drop';

/**
 * Wallet card/circle you can pick up (design system §5 "Wallet card — drag state"). `onClick` fires on a
 * tap/click that never became a drag (the sensors need 4px / a 150ms press first).
 */
export function DraggableWallet({
  id,
  onClick,
  children,
}: {
  id: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: walletDndId(id) });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
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

/**
 * A category: a drop target for wallets (design system §5 "accent border + highlighted fill") and a
 * sortable item (spec §6.4). Only the handle it passes to `children` starts a reorder — the grip on the
 * desktop card, the circle itself on mobile (long-press; a tap still edits).
 */
export function SortableCategory({
  id,
  isCard,
  children,
}: {
  id: string;
  isCard: boolean;
  children: (handle: DragHandleProps) => ReactNode;
}) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
    isOver,
    active,
  } = useSortable({ id: categoryDndId(id) });
  const walletOver = isOver && String(active?.id).startsWith('wallet:');
  return (
    <div
      ref={setNodeRef}
      // Position while sorting is data from dnd-kit, like the progress width.
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        isCard ? 'rounded-card' : 'rounded-full',
        walletOver && 'bg-primary/5 ring-2 ring-primary',
        // Lifted while it moves in place (design system: raised shadow for drag).
        isDragging && 'relative z-10 shadow-card-raised',
      )}
    >
      {children({ ref: setActivatorNodeRef, ...listeners, ...attributes })}
    </div>
  );
}
