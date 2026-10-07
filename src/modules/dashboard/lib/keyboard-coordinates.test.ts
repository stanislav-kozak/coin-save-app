import type { KeyboardCoordinateGetter } from '@dnd-kit/core';
import { describe, expect, it } from 'vitest';
import { keyboardCoordinates } from './keyboard-coordinates';

type Args = Parameters<KeyboardCoordinateGetter>[1];
const key = (code: string) => ({ code, preventDefault() {} }) as unknown as KeyboardEvent;
const args = (activeId: string) =>
  ({
    active: activeId,
    currentCoordinates: { x: 100, y: 100 },
    context: { active: { id: activeId }, collisionRect: null, droppableContainers: new Map() },
  }) as unknown as Args;

describe('keyboardCoordinates', () => {
  it('moves a wallet in steps, free across the screen (it is not a sortable item)', () => {
    expect(keyboardCoordinates(key('ArrowRight'), args('wallet:w1'))).toEqual({ x: 125, y: 100 });
  });

  it('leaves categories to the sortable coordinates (jump between neighbours)', () => {
    // No measured rects in this stub, so the sortable getter has nowhere to jump.
    expect(keyboardCoordinates(key('ArrowRight'), args('category:c1'))).toBeUndefined();
  });
});
