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
import { useSignup } from '../api/auth-mutations';
import { useValidationMessage } from '../hooks/use-validation-message';
import { pendingEmail } from '../lib/pending-email';
import { signupSchema, type SignupValues } from '../schemas';
import { AuthHeader } from './auth-header';
import { GoogleButton } from './google-button';
import { OrDivider } from './or-divider';

export function SignupForm() {
  const t = useTranslations('auth');
  const te = useTranslations('errors');
  const vm = useValidationMessage();
  const router = useRouter();
  const signup = useSignup();
  const { register, handleSubmit, formState } = useForm<
    z.input<typeof signupSchema>,
    unknown,
    SignupValues
  >({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  const errors = formState.errors;

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    try {
      await signup.mutateAsync({ email, password, ...(name ? { name } : {}) });
      pendingEmail.set(email);
      router.push('/check-email');
    } catch {
      // shown below via signup.error
    }
  });

  return (
    <>
      <AuthHeader title={t('signup.title')} subtitle={t('signup.subtitle')} />
      <GoogleButton />
      <OrDivider />
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField id="name" label={t('fields.name')} error={vm(errors.name?.message)}>
          <Input
            id="name"
            autoComplete="name"
            placeholder={t('placeholders.name')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
        </FormField>
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
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={t('placeholders.passwordMin')}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </FormField>
        <p className="text-caption text-muted-foreground">{t('signup.verifyNote')}</p>
        {signup.error ? (
          <p role="alert" className="text-caption text-destructive">
            {te(getErrorCode(signup.error))}
          </p>
        ) : null}
        <Button type="submit" disabled={signup.isPending}>
          {t('signup.submit')}
        </Button>
      </form>
      <p className="mt-6 text-center text-caption text-muted-foreground">
        {t('signup.haveAccount')}{' '}
        <Link href="/login" className="font-medium text-primary">
          {t('signup.loginLink')}
        </Link>
      </p>
    </>
  );
}
