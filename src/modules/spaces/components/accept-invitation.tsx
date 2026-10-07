'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { StatusPanel } from '@/modules/auth';
import { Link, useRouter } from '@/shared/i18n/navigation';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { useAcceptInvitation } from '../api/spaces-mutations';
import { pendingInvitation } from '../lib/pending-invitation';

const isUnauthorized = (e: unknown) =>
  typeof e === 'object' && e !== null && 'statusCode' in e && e.statusCode === 401;
const isAlreadyMember = (e: unknown) => getErrorCode(e) === 'ALREADY_MEMBER';

/**
 * The email link `/invitations/accept?token=…` (a public page). Signed out: keep the token and sign in —
 * the landing redirect brings the user back here. Signed in: join once and open the space.
 */
export function AcceptInvitation({ token }: { token: string | null }) {
  const t = useTranslations('invitations');
  const te = useTranslations('errors');
  const router = useRouter();
  const accept = useAcceptInvitation();
  const started = useRef(false); // a token works once; Strict Mode runs effects twice

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    // Not stored while the request runs: leaving mid-way must not resurrect it on the next landing.
    pendingInvitation.clear();
    accept.mutate(token, {
      onError: (error) => {
        if (!isUnauthorized(error)) return;
        pendingInvitation.set(token); // signed out: keep it across login, then the landing resumes it
        router.replace('/login');
      },
    });
  }, [token, accept, router]);

  const already = accept.isError && isAlreadyMember(accept.error);
  const failed = !token || (accept.isError && !isUnauthorized(accept.error) && !already);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-100">
        {failed ? (
          <StatusPanel icon="error" title={t('failedTitle')}>
            <p role="alert" className="text-body text-muted-foreground">
              {te(token ? getErrorCode(accept.error) : 'INVALID_INVITATION_TOKEN')}
            </p>
            <Button asChild className="mt-3 w-full">
              <Link href="/">{t('home')}</Link>
            </Button>
          </StatusPanel>
        ) : already ? (
          <StatusPanel icon="success" title={t('alreadyTitle')}>
            <Button asChild className="mt-3 w-full">
              <Link href="/">{t('home')}</Link>
            </Button>
          </StatusPanel>
        ) : accept.isSuccess ? (
          <StatusPanel icon="success" title={t('joinedTitle')}>
            <Button asChild className="mt-3 w-full">
              <Link href={`/s/${accept.data.spaceId}`}>{t('open')}</Link>
            </Button>
          </StatusPanel>
        ) : (
          <StatusPanel icon="pending" title={t('joining')} />
        )}
      </div>
    </main>
  );
}
