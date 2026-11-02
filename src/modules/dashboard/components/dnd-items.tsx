'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DragHandleProps } from '@/modules/categories';
import type { CSSProperties, ReactNode } from 'react';
import { entityStyle } from '@/shared/lib/entity-color';
import { cn } from '@/shared/lib/utils';
import { categoryDndId, walletDndId, walletTargetDndId } from '../lib/resolve-drop';

// A drop target under a dragged wallet: outlined in its own colour (the colour edge's, the accent
// without one) and lifted a little. The outline is always there but transparent, so it fades in.
const DROP_TARGET =
  'outline-2 outline-transparent motion-safe:transition-[outline-color,scale,box-shadow] motion-safe:duration-200 motion-safe:ease-out';
const DROP_OVER = 'scale-[1.03] shadow-card-raised outline-[color:var(--entity,var(--primary))]';
// A sortable category also slides (dnd-kit's inline `transition`, which would replace the fade): its
// transition comes in as --sort-transition and joins the fade in one rule.
const SORTABLE_DROP_TARGET =
  'outline-2 outline-transparent motion-safe:[transition:var(--sort-transition,transform_0s),outline-color_200ms_ease-out,scale_200ms_ease-out,box-shadow_200ms_ease-out]';

/**
 * Wallet card/circle you can pick up (design system §5 "Wallet card — drag state") and drop another
 * wallet on (a transfer). `onClick` fires on a tap/click that never became a drag (the sensors need
 * 4px / a 150ms press first).
 */
export function DraggableWallet({
  id,
  color,
  onClick,
  children,
}: {
  id: string;
  /** The wallet's colour: a wallet dropped on it is outlined in it. */
  color?: string | null;
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
      style={entityStyle(color)}
      // touch-none: a long-press must start a drag, not scroll the page (spec §6.6 TouchSensor).
      // no-callout + select-none: a press or a drag never selects text or opens the iOS menu.
      className={cn(
        'no-callout cursor-grab touch-none rounded-card select-none focus-visible:ring-2 focus-visible:ring-ring/50',
        DROP_TARGET,
        isDragging && 'opacity-40',
        otherWalletOver && DROP_OVER,
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
  color,
  children,
}: {
  id: string;
  /** The category's colour: a wallet dropped on it is outlined in it. */
  color?: string | null;
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
      style={
        {
          ...entityStyle(color),
          transform: CSS.Transform.toString(transform),
          '--sort-transition': transition ?? undefined,
        } as CSSProperties
      }
      className={cn(
        // Desktop cards and mobile tiles are both rounded-card; the highlight follows their shape.
        'no-callout rounded-card select-none',
        SORTABLE_DROP_TARGET,
        walletOver && DROP_OVER,
        // Lifted while it moves in place (design system: raised shadow for drag).
        isDragging && 'relative z-10 shadow-card-raised',
      )}
    >
      {children({ ref: setActivatorNodeRef, ...listeners, ...attributes })}
    </div>
  );
}
