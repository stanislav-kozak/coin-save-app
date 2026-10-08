'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Link } from '@/shared/i18n/navigation';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { PasswordInput } from '@/shared/ui/password-input';
import { useResetPassword } from '../api/auth-mutations';
import { useValidationMessage } from '../hooks/use-validation-message';
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas';
import { AuthHeader } from './auth-header';
import { StatusPanel } from './status-panel';

export function ResetPasswordForm({ token }: { token: string | null }) {
  const t = useTranslations('auth');
  const te = useTranslations('errors');
  const vm = useValidationMessage();
  const reset = useResetPassword();
  const { register, handleSubmit, formState } = useForm<
    z.input<typeof resetPasswordSchema>,
    unknown,
    ResetPasswordValues
  >({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  const errors = formState.errors;

  if (!token) {
    return (
      <StatusPanel icon="error" title={t('reset.invalidLink')}>
        <Link href="/forgot-password" className="text-caption font-medium text-primary">
          {t('reset.requestNew')}
        </Link>
      </StatusPanel>
    );
  }

  // Confirm in place: /login is guest-only, so a signed-in user redirected there would land on the
  // app home without ever seeing that the password changed.
  if (reset.isSuccess) {
    return (
      <StatusPanel icon="success" title={t('reset.successTitle')}>
        <p className="text-body text-muted-foreground">{t('reset.successText')}</p>
        <Button asChild className="mt-3 w-full">
          <Link href="/login">{t('reset.toLogin')}</Link>
        </Button>
      </StatusPanel>
    );
  }

  const onSubmit = handleSubmit(({ newPassword }) => reset.mutate({ token, newPassword }));

  return (
    <>
      <AuthHeader title={t('reset.title')} subtitle={t('reset.subtitle')} />
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField
          id="newPassword"
          label={t('fields.newPassword')}
          error={vm(errors.newPassword?.message)}
        >
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            placeholder={t('placeholders.passwordMin')}
            aria-invalid={!!errors.newPassword}
            aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
            {...register('newPassword')}
          />
        </FormField>
        <FormField
          id="confirmPassword"
          label={t('fields.confirmPassword')}
          error={vm(errors.confirmPassword?.message)}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            {...register('confirmPassword')}
          />
        </FormField>
        {reset.error ? (
          <p role="alert" className="text-caption text-destructive">
            {te(getErrorCode(reset.error))}{' '}
            <Link href="/forgot-password" className="font-medium text-primary">
              {t('reset.requestNew')}
            </Link>
          </p>
        ) : null}
        <Button type="submit" loading={reset.isPending} loadingText={t('reset.submitting')}>
          {t('reset.submit')}
        </Button>
      </form>
    </>
  );
}
