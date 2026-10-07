'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { useConnectionStatus, useMemberJoinedNotice } from './realtime-provider';

/**
 * Design system "Connection banner": a thin strip under the header (spec §8.6) when the live
 * connection has been lost for a while; also a brief note when someone joins the space.
 * The live region stays mounted (empty) so screen readers announce the message when it appears; the
 * strip is opaque (a tint over the card colour) because content scrolls under the sticky header.
 */
export function ConnectionBanner() {
  const t = useTranslations('realtime');
  const status = useConnectionStatus();
  const joined = useMemberJoinedNotice();
  const message =
    status === 'disconnected'
      ? { text: t('offline'), tint: 'bg-warning/20' }
      : joined
        ? { text: t('memberJoined'), tint: 'bg-success/15' }
        : null;
  return (
    <div
      role="status"
      className={cn(
        message && 'relative bg-card px-4 py-1 text-center text-caption text-foreground md:px-16',
      )}
    >
      {message ? (
        <>
          <span aria-hidden className={cn('absolute inset-0', message.tint)} />
          <span className="relative">{message.text}</span>
        </>
      ) : null}
    </div>
  );
}
