import { describe, expect, it } from 'vitest';
import { dropCollision } from './drop-collision';

type Args = Parameters<typeof dropCollision>[0];

const rect = (left: number, top: number, w = 100, h = 100) => ({
  left,
  top,
  width: w,
  height: h,
  right: left + w,
  bottom: top + h,
});

function args(pointer: { x: number; y: number } | null): Args {
  const containers = ['category:a', 'category:b'].map((id) => ({
    id,
    data: { current: undefined },
  }));
  return {
    active: { id: 'wallet:w1' },
    // A wide drag ghost that overlaps "b" much more than "a"…
    collisionRect: rect(60, 0, 240, 60),
    droppableRects: new Map([
      ['category:a', rect(0, 0)],
      ['category:b', rect(110, 0)],
    ]),
    droppableContainers: containers,
    pointerCoordinates: pointer,
  } as unknown as Args;
}

describe('dropCollision', () => {
  it('targets what is under the finger/pointer, not what the ghost overlaps most', () => {
    // …but the finger is on "a".
    expect(dropCollision(args({ x: 50, y: 50 }))[0]?.id).toBe('category:a');
  });

  it('falls back to overlap for keyboard drags (no pointer)', () => {
    expect(dropCollision(args(null))[0]?.id).toBe('category:b');
  });
});
