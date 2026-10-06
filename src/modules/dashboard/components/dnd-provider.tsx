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
import { useState, type ReactNode } from 'react';
import { resolveDrop } from '../lib/resolve-drop';

type Props = {
  children: ReactNode;
  renderGhost: (walletId: string) => ReactNode;
  onDrop: (target: { walletId: string; categoryId: string }) => void;
  /** Display name for a dnd id (`wallet:…` / `category:…`), for screen-reader announcements. */
  nameOf: (dndId: string) => string;
};

export function DndProvider({ children, renderGhost, onDrop, nameOf }: Props) {
  const t = useTranslations('dnd');
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  // Spec §6.6
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );
  const announcements: Announcements = {
    onDragStart: ({ active }) => t('start', { wallet: nameOf(String(active.id)) }),
    onDragOver: ({ active, over }) =>
      over
        ? t('over', { wallet: nameOf(String(active.id)), category: nameOf(String(over.id)) })
        : t('outside'),
    onDragEnd: ({ over }) =>
      over ? t('dropped', { category: nameOf(String(over.id)) }) : t('cancelled'),
    onDragCancel: () => t('cancelled'),
  };

  return (
    <DndContext
      sensors={sensors}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: t('instructions') },
      }}
      onDragStart={({ active }) => setActiveWallet(String(active.id).replace(/^wallet:/, ''))}
      onDragCancel={() => setActiveWallet(null)}
      onDragEnd={({ active, over }) => {
        setActiveWallet(null);
        const target = resolveDrop(String(active.id), over ? String(over.id) : null);
        if (target) onDrop(target);
      }}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeWallet ? renderGhost(activeWallet) : null}
      </DragOverlay>
    </DndContext>
  );
}
