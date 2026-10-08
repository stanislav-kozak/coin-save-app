'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { hasLocale, useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Link, useRouter } from '@/shared/i18n/navigation';
import { routing } from '@/shared/i18n/routing';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';
import { useLogin } from '../api/auth-mutations';
import { currentUserQuery } from '../api/use-current-user';
import { useValidationMessage } from '../hooks/use-validation-message';
import { pendingEmail } from '../lib/pending-email';
import { loginSchema, type LoginValues } from '../schemas';
import { AuthHeader } from './auth-header';
import { GoogleButton } from './google-button';
import { OrDivider } from './or-divider';

export function LoginForm() {
  const t = useTranslations('auth');
  const te = useTranslations('errors');
  const vm = useValidationMessage();
  const router = useRouter();
  const login = useLogin();
  const locale = useLocale();
  const queryClient = useQueryClient();
  // Busy from the click until the app opens: signing in is followed by reading the saved language.
  const [entering, setEntering] = useState(false);
  const { register, handleSubmit, formState } = useForm<
    z.input<typeof loginSchema>,
    unknown,
    LoginValues
  >({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const errors = formState.errors;
  const apiError = login.error ? getErrorCode(login.error) : null;

  const onSubmit = handleSubmit(async (values) => {
    try {
      setEntering(true);
      await login.mutateAsync(values);
      // Spec §11: the account's saved language wins over the login page's.
      const saved = await queryClient.fetchQuery({ ...currentUserQuery, retry: false }).then(
        (me) => me.locale,
        () => null, // not worth blocking the sign-in
      );
      if (saved !== locale && hasLocale(routing.locales, saved)) {
        router.replace('/', { locale: saved });
      } else {
        router.replace('/');
      }
    } catch (error) {
      setEntering(false);
      if (getErrorCode(error) === 'EMAIL_NOT_VERIFIED') {
        pendingEmail.set(values.email);
        router.push('/check-email');
      }
    }
  });

  return (
    <>
      <AuthHeader title={t('login.title')} subtitle={t('login.subtitle')} />
      <GoogleButton />
      <OrDivider />
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
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
        <FormField id="password" label={t('fields.password')} error={vm(errors.password?.message)}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </FormField>
        <Link href="/forgot-password" className="self-end text-caption font-medium text-primary">
          {t('login.forgot')}
        </Link>
        {apiError && apiError !== 'EMAIL_NOT_VERIFIED' ? (
          <p role="alert" className="text-caption text-destructive">
            {te(apiError)}
          </p>
        ) : null}
        <Button
          type="submit"
          loading={login.isPending || entering}
          loadingText={t('login.submitting')}
        >
          {t('login.submit')}
        </Button>
      </form>
      <p className="mt-6 text-center text-caption text-muted-foreground">
        {t('login.noAccount')}{' '}
        <Link href="/signup" className="font-medium text-primary">
          {t('login.signupLink')}
        </Link>
      </p>
    </>
  );
}
