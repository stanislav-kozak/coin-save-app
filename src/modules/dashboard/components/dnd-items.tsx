'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DragHandleProps } from '@/modules/categories';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { categoryDndId, walletDndId, walletTargetDndId } from '../lib/resolve-drop';

/**
 * Wallet card/circle you can pick up (design system §5 "Wallet card — drag state") and drop another
 * wallet on (a transfer). `onClick` fires on a tap/click that never became a drag (the sensors need
 * 4px / a 150ms press first).
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
  const drag = useDraggable({ id: walletDndId(id) });
  const drop = useDroppable({ id: walletTargetDndId(id) });
  const { listeners, attributes, isDragging } = drag;
  const otherWalletOver =
    drop.isOver &&
    String(drop.active?.id).startsWith('wallet:') &&
    drop.active?.id !== walletDndId(id);
  return (
    <div
      ref={(node) => {
        drag.setNodeRef(node);
        drop.setNodeRef(node);
      }}
      {...listeners}
      {...attributes}
      onClick={onClick}
      // touch-none: a long-press must start a drag, not scroll the page (spec §6.6 TouchSensor).
      // no-callout + select-none: a press or a drag never selects text or opens the iOS menu.
      className={cn(
        'no-callout cursor-grab touch-none rounded-card outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 motion-safe:transition-transform',
        isDragging && 'opacity-40',
        otherWalletOver && 'scale-105 shadow-card-raised ring-2 ring-primary',
      )}
    >
      {children}
    </div>
  );
}

/**
 * A category: a drop target for wallets (design system §5 "accent border + highlighted fill") and a
 * sortable item (spec §6.4). Only the handle it passes to `children` starts a reorder — the grip on the
 * desktop card, the tile itself on mobile (a tap still edits).
 */
export function SortableCategory({
  id,
  children,
}: {
  id: string;
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
        // Desktop cards and mobile tiles are both rounded-card; the highlight follows their shape.
        'no-callout rounded-card transition-transform select-none',
        walletOver && 'scale-105 shadow-card-raised ring-2 ring-primary',
        // Lifted while it moves in place (design system: raised shadow for drag).
        isDragging && 'relative z-10 shadow-card-raised',
      )}
    >
      {children({ ref: setActivatorNodeRef, ...listeners, ...attributes })}
    </div>
  );
}
