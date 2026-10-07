import { describe, expect, it } from 'vitest';
import { isTap } from './is-tap';

const touch = { type: 'touchstart' } as Event;
const mouse = { type: 'pointerdown' } as Event;

describe('isTap', () => {
  it('treats a touch drag that never moved and ended on itself as a tap', () => {
    expect(
      isTap({ activatorEvent: touch, delta: { x: 2, y: -1 }, activeId: 'wallet:w1', overId: null }),
    ).toBe(true);
    expect(
      isTap({
        activatorEvent: touch,
        delta: { x: 0, y: 0 },
        activeId: 'category:c1',
        overId: 'category:c1',
      }),
    ).toBe(true);
  });

  it('keeps real drags, drops elsewhere and non-touch input as drags', () => {
    expect(
      isTap({ activatorEvent: touch, delta: { x: 40, y: 0 }, activeId: 'wallet:w1', overId: null }),
    ).toBe(false);
    expect(
      isTap({
        activatorEvent: touch,
        delta: { x: 1, y: 1 },
        activeId: 'wallet:w1',
        overId: 'category:c1',
      }),
    ).toBe(false);
    expect(
      isTap({ activatorEvent: mouse, delta: { x: 0, y: 0 }, activeId: 'wallet:w1', overId: null }),
    ).toBe(false);
  });
});
