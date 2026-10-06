'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Link } from '@/shared/i18n/navigation';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useRequestPasswordReset } from '../api/auth-mutations';
import { useValidationMessage } from '../hooks/use-validation-message';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas';
import { AuthHeader } from './auth-header';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const te = useTranslations('errors');
  const vm = useValidationMessage();
  const request = useRequestPasswordReset();
  const { register, handleSubmit, formState } = useForm<
    z.input<typeof forgotPasswordSchema>,
    unknown,
    ForgotPasswordValues
  >({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });
  const errors = formState.errors;

  return (
    <>
      <AuthHeader title={t('forgot.title')} subtitle={t('forgot.subtitle')} />
      {request.isSuccess ? (
        <p className="text-body text-success">{t('forgot.sent')}</p>
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit((values) => request.mutate(values))}
          className="flex flex-col gap-4"
        >
          <FormField id="email" label={t('fields.email')} error={vm(errors.email?.message)}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('placeholders.email')}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
          </FormField>
          {request.error ? (
            <p role="alert" className="text-caption text-destructive">
              {te(getErrorCode(request.error))}
            </p>
          ) : null}
          <Button type="submit" disabled={request.isPending}>
            {t('forgot.submit')}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-caption text-muted-foreground">
        {t('forgot.remembered')}{' '}
        <Link href="/login" className="font-medium text-primary">
          {t('forgot.loginLink')}
        </Link>
      </p>
    </>
  );
}
