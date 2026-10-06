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
const HEX = /^#[0-9a-f]{6}$/i; // the backend validates the same; never inject anything else into style

type Props = {
  id: string;
  color?: string | null;
  icon?: string | null;
  size: keyof typeof SIZES;
  label?: string;
};

/** Wallet/category circle: the entity's own color (user data, not a design token) with its emoji. */
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
      {icon}
    </span>
  );
}
