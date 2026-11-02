'use client';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
} from '@dnd-kit/core';
import { useTranslations } from 'next-intl';
import { useId, useState, type ReactNode } from 'react';
import { dropCollision } from '../lib/drop-collision';
import { keyboardCoordinates } from '../lib/keyboard-coordinates';
import { resolveDrop, type Drop } from '../lib/resolve-drop';

type Props = {
  children: ReactNode;
  /** The dragged item's overlay, by dnd id (`wallet:…` / `category:…`). */
  renderGhost: (dndId: string) => ReactNode;
  /** A wallet dropped on a category (an expense) or on another wallet (a transfer). */
  onDrop: (target: Drop) => void;
  /** A category dropped somewhere (spec §6.4); the dashboard decides whether it moved. */
  onReorder: (activeId: string, overId: string | null) => void;
  /** Display name for a dnd id (`wallet:…` / `category:…`), for screen-reader announcements. */
  nameOf: (dndId: string) => string;
};

const isCategory = (dndId: string) => dndId.startsWith('category:');
const isWalletTarget = (dndId: string) => dndId.startsWith('walletTarget:');

/** No text selection anywhere while dragging (globals.css `html[data-dragging]`). */
function setDragging(on: boolean) {
  if (on) {
    window.getSelection()?.removeAllRanges(); // a press may already have started one
    document.documentElement.dataset.dragging = '';
  } else {
    delete document.documentElement.dataset.dragging;
  }
}

export function DndProvider({ children, renderGhost, onDrop, onReorder, nameOf }: Props) {
  const t = useTranslations('dnd');
  const id = useId(); // dnd-kit's own ids come from a module counter that differs between server and client
  const [activeId, setActiveId] = useState<string | null>(null);
  // Spec §6.6
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates }),
  );
  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      isCategory(String(active.id))
        ? t('reorderStart', { category: nameOf(String(active.id)) })
        : t('start', { wallet: nameOf(String(active.id)) }),
    onDragOver: ({ active, over }) => {
      if (!over) return t('outside');
      const [a, o] = [String(active.id), String(over.id)];
      if (isCategory(a)) return t('reorderOver', { category: nameOf(a), target: nameOf(o) });
      return isWalletTarget(o)
        ? t('overWallet', { wallet: nameOf(a), target: nameOf(o) })
        : t('over', { wallet: nameOf(a), category: nameOf(o) });
    },
    onDragEnd: ({ active, over }) => {
      if (!over) return t('cancelled');
      if (isCategory(String(active.id))) {
        return t('reorderDropped', { category: nameOf(String(active.id)) });
      }
      return isWalletTarget(String(over.id))
        ? t('droppedWallet', { target: nameOf(String(over.id)) })
        : t('dropped', { category: nameOf(String(over.id)) });
    },
    onDragCancel: () => t('cancelled'),
  };

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={dropCollision}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: t('instructions') },
      }}
      onDragStart={({ active }) => {
        setDragging(true);
        setActiveId(String(active.id));
      }}
      onDragCancel={() => {
        setDragging(false);
        setActiveId(null);
      }}
      onDragEnd={({ active, over }) => {
        setDragging(false);
        setActiveId(null);
        const [a, o] = [String(active.id), over ? String(over.id) : null];
        if (isCategory(a)) return onReorder(a, o);
        const target = resolveDrop(a, o);
        if (target) onDrop(target);
      }}
    >
      {children}
      <DragOverlay dropAnimation={null}>{activeId ? renderGhost(activeId) : null}</DragOverlay>
    </DndContext>
  );
}
