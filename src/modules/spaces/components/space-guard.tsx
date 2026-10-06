'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, type ReactNode } from 'react';
import { StatusPanel } from '@/modules/auth';
import { Link } from '@/shared/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { useSpace } from '../api/spaces-queries';
import { lastSpace } from '../lib/last-space';

/** Renders a space's pages only when the user can open it; remembers it for the next landing. */
export function SpaceGuard({ spaceId, children }: { spaceId: string; children: ReactNode }) {
  const t = useTranslations('spaces.unavailable');
  const queryClient = useQueryClient();
  const space = useSpace(spaceId);

  useEffect(() => {
    if (space.data) lastSpace.set(space.data.id);
  }, [space.data]);

  useEffect(() => {
    if (!space.isError) return;
    // The cached list may still contain this space (removed/deleted while the app was open): refresh it
    // and forget it as "last", or landing and the switcher would send the user straight back here.
    lastSpace.forget(spaceId);
    void queryClient.invalidateQueries({ queryKey: ['spaces'], exact: true });
  }, [space.isError, spaceId, queryClient]);

  if (space.isError) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-100">
          <StatusPanel icon="error" title={t('title')}>
            <p className="text-body text-muted-foreground">{t('text')}</p>
            <Button asChild className="mt-3 w-full">
              <Link href="/">{t('back')}</Link>
            </Button>
          </StatusPanel>
        </div>
      </main>
    );
  }
  if (!space.data) return null;
  return <>{children}</>;
}
