'use client';

import { useTranslations } from 'next-intl';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from './button';

/** A section that failed to load says so and offers a retry instead of silently vanishing. */
export function SectionError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const te = useTranslations('errors');
  const t = useTranslations('common');
  return (
    <div className="flex flex-col items-start gap-3 rounded-card border border-border bg-card p-4">
      <p role="alert" className="text-caption text-destructive">
        {te(getErrorCode(error))}
      </p>
      <Button variant="secondary" size="s" onClick={onRetry}>
        {t('retry')}
      </Button>
    </div>
  );
}
