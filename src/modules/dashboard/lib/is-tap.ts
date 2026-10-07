const SLOP = 5; // px: the TouchSensor tolerance

/**
 * A touch held past the TouchSensor delay (150ms) starts a "drag" even when the finger never moves, and
 * dnd-kit then swallows the click — so a slow tap would do nothing. Such a drag is a tap.
 * Mouse/keyboard drags never count: the pointer needs 4px to start, and keyboard lift+drop is a cancel.
 */
export function isTap({
  activatorEvent,
  delta,
  activeId,
  overId,
}: {
  activatorEvent: Event | null;
  delta: { x: number; y: number };
  activeId: string;
  overId: string | null;
}): boolean {
  return (
    !!activatorEvent?.type.startsWith('touch') &&
    Math.hypot(delta.x, delta.y) < SLOP &&
    (overId === null || overId === activeId)
  );
}
