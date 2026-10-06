'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/shared/i18n/navigation';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { useResendVerification } from '../api/auth-mutations';
import { pendingEmail } from '../lib/pending-email';
import { StatusPanel } from './status-panel';

/** Rendered client-only (see check-email-client.tsx): the address lives in sessionStorage. */
export function CheckEmail() {
  const t = useTranslations('auth.checkEmail');
  const te = useTranslations('errors');
  const [email] = useState(() => pendingEmail.get());
  const resend = useResendVerification();

  return (
    <StatusPanel icon="mail" title={t('title')}>
      {email ? (
        <p className="text-body text-muted-foreground">
          {t('sentTo')}
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      ) : (
        <p className="text-body text-muted-foreground">{t('sentGeneric')}</p>
      )}
      <p className="text-caption text-muted-foreground">{t('spamHint')}</p>
      {email ? (
        <Button
          variant="secondary"
          disabled={resend.isPending}
          onClick={() => resend.mutate({ email })}
        >
          {t('resend')}
        </Button>
      ) : null}
      {resend.isSuccess ? <p className="text-caption text-success">{t('resent')}</p> : null}
      {resend.error ? (
        <p role="alert" className="text-caption text-destructive">
          {te(getErrorCode(resend.error))}
        </p>
      ) : null}
      <Link href="/signup" className="text-caption font-medium text-primary">
        {t('changeEmail')}
      </Link>
    </StatusPanel>
  );
}
