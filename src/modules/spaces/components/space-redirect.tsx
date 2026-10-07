'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { StatusPanel } from '@/modules/auth';
import { useRouter } from '@/shared/i18n/navigation';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { PageSkeleton, Skeleton } from '@/shared/ui/skeleton';
import { useSpaces } from '../api/spaces-queries';
import { lastSpace, pickLandingSpace } from '../lib/last-space';
import { pendingInvitation } from '../lib/pending-invitation';

/**
 * `/[locale]`: opens the last (or first) space, or onboarding when there is none.
 * Its authenticated request also catches a dead session (→ refresh fails → login).
 */
export function SpaceRedirect() {
  const t = useTranslations('spaces');
  const te = useTranslations('errors');
  const tc = useTranslations('common');
  const router = useRouter();
  const spaces = useSpaces();

  useEffect(() => {
    // Act on a fresh list only: a stale cache could point back at a space the user just lost.
    // An invitation opened before signing in finishes first (it may add the space to land on).
    const invitation = pendingInvitation.get();
    if (invitation) {
      router.replace(`/invitations/accept?token=${encodeURIComponent(invitation)}`);
      return;
    }
    if (!spaces.data || spaces.isFetching) return;
    const id = pickLandingSpace(spaces.data, lastSpace.get());
    router.replace(id ? `/s/${id}` : '/onboarding');
  }, [spaces.data, spaces.isFetching, router]);

  if (spaces.isError && !spaces.isFetching) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-100">
          <StatusPanel icon="error" title={te('UNKNOWN_ERROR')}>
            <p role="alert" className="text-body text-muted-foreground">
              {te(getErrorCode(spaces.error))}
            </p>
            <Button className="mt-3 w-full" onClick={() => void spaces.refetch()}>
              {t('retry')}
            </Button>
          </StatusPanel>
        </div>
      </main>
    );
  }
  // Landing takes a request and a redirect: show the app's frame rather than a blank page.
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:px-16">
        <Skeleton shape="circle" className="size-10" />
        <Skeleton className="h-5 w-32" />
      </div>
      <PageSkeleton label={tc('loading')} />
    </div>
  );
}
