/** Wallet/category icon colors (design system §2 palette, Figma 10:176 icon fills). Hex is what the API stores. */
export const ENTITY_COLORS = [
  { name: 'blue', hex: '#3b82f6', className: 'bg-palette-blue' },
  { name: 'teal', hex: '#15bba3', className: 'bg-palette-teal' },
  { name: 'amber', hex: '#f59e0b', className: 'bg-palette-amber' },
  { name: 'violet', hex: '#8b5cf6', className: 'bg-palette-violet' },
  { name: 'emerald', hex: '#10b981', className: 'bg-palette-emerald' },
  { name: 'indigo', hex: '#6366f1', className: 'bg-palette-indigo' },
  { name: 'pink', hex: '#ec4999', className: 'bg-palette-pink' },
  { name: 'slate', hex: '#64748b', className: 'bg-palette-slate' },
] as const;

export type EntityColorName = (typeof ENTITY_COLORS)[number]['name'];

/** First palette color not used yet, so a new wallet/category is told apart at a glance. */
export function firstUnusedColor(used: (string | null | undefined)[]): string {
  const taken = new Set(used.flatMap((c) => (c ? [c.toLowerCase()] : [])));
  return (ENTITY_COLORS.find((c) => !taken.has(c.hex)) ?? ENTITY_COLORS[0]).hex;
}
