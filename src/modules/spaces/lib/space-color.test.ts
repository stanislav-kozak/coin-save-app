import { describe, expect, it } from 'vitest';
import { spaceColor } from './space-color';

describe('spaceColor', () => {
  it('is stable for the same space', () => {
    expect(spaceColor('ck1abc')).toBe(spaceColor('ck1abc'));
  });
  it('spreads different spaces over the palette', () => {
    const ids = Array.from({ length: 30 }, (_, i) => `space-${i}`);
    expect(new Set(ids.map(spaceColor)).size).toBeGreaterThan(3);
  });
});
