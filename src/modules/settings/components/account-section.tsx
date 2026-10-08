'use client';

import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/modules/auth';
import { initials } from '@/shared/lib/initials';
import { LoadingRegion, Skeleton } from '@/shared/ui/skeleton';
import { SettingsSection } from './settings-section';

/** «Особисті дані»: avatar, name and email. */
export function AccountSection() {
  const t = useTranslations('profile.account');
  const tc = useTranslations('common');
  const me = useCurrentUser();

  return (
    <SettingsSection id="account" title={t('title')}>
      {me.data ? (
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-h2 text-primary-foreground"
          >
            {initials(me.data)}
          </span>
          <div className="flex min-w-0 flex-col">
            {me.data.name ? <span className="text-body font-medium">{me.data.name}</span> : null}
            <span className="truncate text-body text-muted-foreground">{me.data.email}</span>
          </div>
        </div>
      ) : (
        <LoadingRegion label={tc('loading')} className="flex items-center gap-4">
          <Skeleton shape="circle" className="size-14" />
          <Skeleton className="h-4 w-48" />
        </LoadingRegion>
      )}
    </SettingsSection>
  );
}
