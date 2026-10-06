'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Link, useRouter } from '@/shared/i18n/navigation';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useResetPassword } from '../api/auth-mutations';
import { useValidationMessage } from '../hooks/use-validation-message';
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas';
import { AuthHeader } from './auth-header';
import { StatusPanel } from './status-panel';

export function ResetPasswordForm({ token }: { token: string | null }) {
  const t = useTranslations('auth');
  const te = useTranslations('errors');
  const vm = useValidationMessage();
  const router = useRouter();
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

  const onSubmit = handleSubmit(async ({ newPassword }) => {
    try {
      await reset.mutateAsync({ token, newPassword });
      router.replace({ pathname: '/login', query: { reset: '1' } });
    } catch {
      // shown below via reset.error
    }
  });

  return (
    <>
      <AuthHeader title={t('reset.title')} subtitle={t('reset.subtitle')} />
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField
          id="newPassword"
          label={t('fields.newPassword')}
          error={vm(errors.newPassword?.message)}
        >
          <Input
            id="newPassword"
            type="password"
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
          <Input
            id="confirmPassword"
            type="password"
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
        <Button type="submit" disabled={reset.isPending}>
          {t('reset.submit')}
        </Button>
      </form>
    </>
  );
}
