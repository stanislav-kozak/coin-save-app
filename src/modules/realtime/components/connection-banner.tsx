'use client';

import { useTranslations } from 'next-intl';
import { useConnectionStatus, useMemberJoinedNotice } from './realtime-provider';

const STRIP = 'px-4 py-1 text-center text-caption text-foreground md:px-16';

/**
 * Design system "Connection banner": a thin strip under the header (spec §8.6) when the live
 * connection has been lost for a while; also a brief note when someone joins the space.
 */
export function ConnectionBanner() {
  const t = useTranslations('realtime');
  const status = useConnectionStatus();
  const joined = useMemberJoinedNotice();
  if (status === 'disconnected') {
    return (
      <p role="status" className={`${STRIP} bg-warning/20`}>
        {t('offline')}
      </p>
    );
  }
  if (joined) {
    return (
      <p role="status" className={`${STRIP} bg-success/15`}>
        {t('memberJoined')}
      </p>
    );
  }
  return null;
}
