import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ENTITY_COLORS, firstUnusedColor } from './entity-colors';

describe('ENTITY_COLORS', () => {
  it('matches the palette tokens in globals.css (Figma 10:176 icon fills)', () => {
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
    for (const c of ENTITY_COLORS) {
      expect(css).toMatch(new RegExp(`--palette-${c.name}:\\s*${c.hex};`, 'i'));
      expect(c.className).toBe(`bg-palette-${c.name}`);
    }
    expect(ENTITY_COLORS).toHaveLength(8);
  });

  it('picks the first color no entity uses yet, case-insensitively', () => {
    expect(firstUnusedColor([])).toBe('#3b82f6');
    expect(firstUnusedColor(['#3B82F6', null])).toBe('#15bba3');
    expect(firstUnusedColor(ENTITY_COLORS.map((c) => c.hex))).toBe('#3b82f6'); // all used → wrap
  });
});
