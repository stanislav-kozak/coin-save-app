import { cn } from '@/shared/lib/utils';

export type BrandMotion = 'static' | 'intro' | 'loop';

const ARC: Record<BrandMotion, string> = {
  static: '',
  intro: 'motion-safe:animate-brand-draw',
  loop: 'motion-safe:animate-brand-draw-loop',
};
const COIN: Record<BrandMotion, string> = {
  static: '',
  intro: 'motion-safe:animate-brand-pop',
  loop: 'motion-safe:animate-brand-pop-loop',
};

/**
 * The CoinSaveKeeper mark (direction D1): a «C» — a coin's rim — holding a gold coin. Decorative;
 * a caller that needs a name puts it on the surrounding element. Without motion (or with reduced
 * motion) it's the final frame: the attributes below are that frame, the animations only lead to it.
 */
export function BrandMark({
  size = 32,
  motion = 'static',
  tone = 'default',
  className,
}: {
  size?: number;
  motion?: BrandMotion;
  tone?: 'default' | 'on-primary';
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <circle
        data-part="arc"
        cx="40"
        cy="40"
        r="28"
        fill="none"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray="176"
        strokeDashoffset="38"
        transform="rotate(38 40 40)"
        className={cn(
          tone === 'on-primary' ? 'stroke-primary-foreground' : 'stroke-primary',
          ARC[motion],
        )}
      />
      <circle
        data-part="coin"
        cx="40"
        cy="40"
        r="9"
        className={cn(
          'fill-palette-amber [transform-box:fill-box] [transform-origin:center]',
          COIN[motion],
        )}
      />
    </svg>
  );
}
