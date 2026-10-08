'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/shared/i18n/navigation';
import { BrandMark } from '@/shared/ui/brand-mark';

/** Header variant A: the mark before the space switcher, home of the current space. */
export function HeaderBrand({ spaceId }: { spaceId: string }) {
  const t = useTranslations('shell');
  return (
    <div className="flex shrink-0 items-center gap-3">
      <Link
        href={`/s/${spaceId}`}
        aria-label={t('brandHome')}
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <BrandMark size={28} className="size-6 md:size-7" />
      </Link>
      <span aria-hidden className="h-6 w-px bg-border" />
    </div>
  );
}
