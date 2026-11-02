import { resolveIcon } from '@/shared/constants/wallet-icons';
import { ENTITY_HEX as HEX } from '@/shared/lib/entity-color';
import { cn } from '@/shared/lib/utils';

const FALLBACK = [
  'bg-primary',
  'bg-palette-blue',
  'bg-palette-violet',
  'bg-palette-teal',
  'bg-palette-amber',
  'bg-palette-emerald',
];
const SIZES = {
  xs: 'size-6 text-caption',
  s: 'size-8 text-body',
  m: 'size-10 text-h2',
  l: 'size-12 text-h1',
};
// Line icons and currency symbols, sized to the circle (an emoji takes the text size above).
const GLYPHS = {
  xs: { line: 'size-3.5', symbol: 'text-caption' },
  s: { line: 'size-4', symbol: 'text-caption' },
  m: { line: 'size-5', symbol: 'text-body' },
  l: { line: 'size-6', symbol: 'text-h2' },
};

type Props = {
  id: string;
  color?: string | null;
  icon?: string | null;
  size: keyof typeof SIZES;
  label?: string;
};

/**
 * Wallet/category circle: the entity's own color (user data, not a design token) with its emoji, or a
 * wallet's line icon / currency symbol (`i:…` / `c:…`, shared/constants/wallet-icons).
 */
export function EntityIcon({ id, color, icon, size, label }: Props) {
  const valid = color && HEX.test(color) ? color : null;
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={valid ? { backgroundColor: valid } : undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full leading-none',
        SIZES[size],
        !valid && FALLBACK[hash % FALLBACK.length],
      )}
    >
      {icon ? <Glyph value={icon} size={size} /> : null}
    </span>
  );
}

const ink = (dark: boolean) => (dark ? 'text-glyph-dark' : 'text-glyph-light');

function Glyph({ value, size }: { value: string; size: keyof typeof SIZES }) {
  const glyph = resolveIcon(value);
  if (glyph.kind === 'line') {
    return <glyph.Icon aria-hidden className={cn(GLYPHS[size].line, ink(glyph.dark))} />;
  }
  if (glyph.kind === 'symbol') {
    return (
      <span className={cn(GLYPHS[size].symbol, 'font-semibold', ink(glyph.dark))}>
        {glyph.text}
      </span>
    );
  }
  return glyph.text;
}
