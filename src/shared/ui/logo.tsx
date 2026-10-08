import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { BrandMark, type BrandMotion } from './brand-mark';

/** The mark plus «CoinSave / KEEPER». Spoken as one name. */
export function Logo({
  motion = 'static',
  tone = 'default',
  size = 'm',
  className,
}: {
  motion?: BrandMotion;
  tone?: 'default' | 'on-primary';
  /** `auth`: responsive, for the sign-in panel (compact strip on phones, large on desktop). */
  size?: 'm' | 'auth';
  className?: string;
}) {
  const t = useTranslations('common');
  const onPrimary = tone === 'on-primary';
  return (
    <span role="img" aria-label={t('appName')} className={cn('flex items-center gap-3', className)}>
      <BrandMark
        size={size === 'auth' ? 64 : 36}
        motion={motion}
        tone={tone}
        className={size === 'auth' ? 'size-10 md:size-16' : undefined}
      />
      <span aria-hidden className="flex flex-col leading-none">
        <span
          className={cn(
            size === 'auth' ? 'text-h1 md:text-display' : 'text-h2',
            'font-bold tracking-tight',
            onPrimary ? 'text-primary-foreground' : 'text-foreground',
          )}
        >
          CoinSave
        </span>
        <span
          className={cn(
            'mt-1 text-caption font-semibold tracking-[0.24em]',
            onPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground',
          )}
        >
          KEEPER
        </span>
      </span>
    </span>
  );
}
