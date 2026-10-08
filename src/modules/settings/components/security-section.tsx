'use client';

import { useTranslations } from 'next-intl';
import { useCurrentUser, useRequestPasswordReset } from '@/modules/auth';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { SettingsSection } from './settings-section';

/** «Безпека»: the password is changed through the reset email (no change-password endpoint). */
export function SecuritySection() {
  const t = useTranslations('profile.security');
  const te = useTranslations('errors');
  const me = useCurrentUser();
  const reset = useRequestPasswordReset();
  const email = me.data?.email;

  return (
    <SettingsSection id="security" title={t('title')}>
      <p className="text-body text-muted-foreground">{t('hint')}</p>
      <Button
        variant="secondary"
        className="self-start"
        disabled={!email || reset.isPending}
        onClick={() => email && reset.mutate({ email })}
      >
        {t('changePassword')}
      </Button>
      {reset.isSuccess && email ? (
        <p role="status" className="text-caption text-success">
          {t('sent', { email })}
        </p>
      ) : null}
      {reset.isError ? (
        <p role="alert" className="text-caption text-destructive">
          {te(getErrorCode(reset.error))}
        </p>
      ) : null}
    </SettingsSection>
  );
}
