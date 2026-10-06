// Space avatar colors (Figma 16:750/755/759: accent, blue, violet …) — token classes only.
const COLORS = [
  'bg-primary',
  'bg-palette-blue',
  'bg-palette-violet',
  'bg-palette-teal',
  'bg-palette-amber',
  'bg-palette-emerald',
] as const;

export function spaceColor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
}
