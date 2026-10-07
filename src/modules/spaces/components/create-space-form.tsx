'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  currencyLabel,
} from '@/shared/constants/currencies';
import { useRouter } from '@/shared/i18n/navigation';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useCreateSpace, useSpaces } from '../api/spaces-queries';
import { createSpaceSchema, type CreateSpaceValues } from '../schemas';

type ValidationKey = 'nameRequired' | 'nameTooLong';

export function CreateSpaceForm() {
  const t = useTranslations('spaces');
  const te = useTranslations('errors');
  const locale = useLocale();
  const router = useRouter();
  const spaces = useSpaces();
  const create = useCreateSpace();
  const { register, handleSubmit, formState } = useForm<
    z.input<typeof createSpaceSchema>,
    unknown,
    CreateSpaceValues
  >({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: { name: '', currency: DEFAULT_CURRENCY },
  });
  const nameError = formState.errors.name?.message as ValidationKey | undefined;
  const isFirst = spaces.data?.length === 0;

  const onSubmit = handleSubmit(async (values) => {
    // Stays locked after success too: the navigation to the new space isn't instant.
    if (create.isPending || create.isSuccess) return;
    try {
      const space = await create.mutateAsync(values);
      router.replace(`/s/${space.id}`);
    } catch {
      // shown below via create.error
    }
  });

  return (
    <main className="flex min-h-dvh justify-center bg-background px-4 py-12 md:items-center">
      <div className="w-full max-w-120">
        <span aria-hidden className="mb-6 block size-12 rounded-full bg-primary" />
        <h1 className="text-h1">{isFirst ? t('onboarding.firstTitle') : t('onboarding.title')}</h1>
        <p className="mt-2 mb-6 text-body text-muted-foreground">{t('onboarding.subtitle')}</p>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField
            id="space-name"
            label={t('onboarding.name')}
            error={nameError ? t(`validation.${nameError}`) : undefined}
          >
            <Input
              id="space-name"
              autoComplete="off"
              placeholder={t('onboarding.namePlaceholder')}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? 'space-name-error' : undefined}
              {...register('name')}
            />
          </FormField>
          <FormField id="space-currency" label={t('onboarding.currency')}>
            <select
              id="space-currency"
              className="h-10 w-full rounded-control border border-input bg-card px-3 text-field md:text-body text-foreground outline-none focus-visible:border-primary"
              {...register('currency')}
            >
              {SUPPORTED_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {currencyLabel(code, locale)}
                </option>
              ))}
            </select>
          </FormField>
          {create.error ? (
            <p role="alert" className="text-caption text-destructive">
              {te(getErrorCode(create.error))}
            </p>
          ) : null}
          <Button type="submit" disabled={create.isPending || create.isSuccess}>
            {t('onboarding.submit')}
          </Button>
        </form>
      </div>
    </main>
  );
}
