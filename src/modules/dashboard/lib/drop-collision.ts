import { pointerWithin, rectIntersection, type CollisionDetection } from '@dnd-kit/core';

/**
 * The drop target is what is under the finger/pointer — on a phone the drag ghost can cover several
 * tiles, and "most overlapped" would highlight a neighbour. Keyboard drags have no pointer: overlap.
 */
export const dropCollision: CollisionDetection = (args) => {
  if (args.pointerCoordinates) {
    const under = pointerWithin(args);
    if (under.length > 0) return under;
  }
  return rectIntersection(args);
};
