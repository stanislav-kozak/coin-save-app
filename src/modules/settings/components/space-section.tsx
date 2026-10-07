'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useSpace, useUpdateSpace } from '@/modules/spaces';
import { SUPPORTED_CURRENCIES, currencyLabel } from '@/shared/constants/currencies';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { LoadingRegion, Skeleton } from '@/shared/ui/skeleton';
import { useMyRole } from '../lib/use-my-role';
import { SettingsSection } from './settings-section';

const schema = z.object({
  name: z.string().trim().min(1, { error: 'nameRequired' }).max(100, { error: 'nameTooLong' }),
});
type Values = z.output<typeof schema>;

const SELECT =
  'h-10 w-full rounded-control border border-input bg-card px-3 text-body text-foreground outline-none disabled:opacity-60';

/** «Простір»: the owner renames it; the primary currency waits for the backend's contract. */
export function SpaceSection({ spaceId }: { spaceId: string }) {
  const t = useTranslations('settings.space');
  const tc = useTranslations('common');
  const space = useSpace(spaceId);
  const role = useMyRole(spaceId);
  return (
    <SettingsSection id="space" title={t('title')}>
      {!space.data || !role ? (
        <LoadingRegion label={tc('loading')} className="flex flex-col gap-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </LoadingRegion>
      ) : role === 'OWNER' ? (
        <SpaceForm spaceId={spaceId} space={space.data} />
      ) : (
        <dl className="grid gap-3 md:grid-cols-2">
          <div>
            <dt className="text-caption text-muted-foreground">{t('name')}</dt>
            <dd className="text-body">{space.data.name}</dd>
          </div>
          <div>
            <dt className="text-caption text-muted-foreground">{t('currency')}</dt>
            <dd className="text-body">{space.data.primaryCurrency}</dd>
          </div>
        </dl>
      )}
    </SettingsSection>
  );
}

function SpaceForm({
  spaceId,
  space,
}: {
  spaceId: string;
  space: { name: string; primaryCurrency: string };
}) {
  const t = useTranslations('settings.space');
  const te = useTranslations('errors');
  const locale = useLocale();
  const update = useUpdateSpace(spaceId);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState, control } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: space.name },
  });
  const name = useWatch({ control, name: 'name' });
  const changed = name.trim() !== space.name;
  const nameError = formState.errors.name?.message;

  const save = async (values: Values) => {
    setSaved(false);
    try {
      await update.mutateAsync({ name: values.name });
      setSaved(true);
    } catch {
      // shown below via update.error
    }
  };

  return (
    <form
      noValidate
      onSubmit={(e) => void handleSubmit(save)(e)}
      className="grid gap-4 md:grid-cols-2"
    >
      <FormField
        id="space-name"
        label={t('name')}
        error={
          nameError ? t(`validation.${nameError as 'nameRequired' | 'nameTooLong'}`) : undefined
        }
      >
        <Input
          id="space-name"
          autoComplete="off"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'space-name-error' : undefined}
          {...register('name')}
        />
      </FormField>
      <div className="flex flex-col gap-1">
        <FormField id="space-currency" label={t('currency')}>
          {/* Held until the backend decides how history converts (old totals would mix currencies). */}
          <select
            id="space-currency"
            disabled
            value={space.primaryCurrency}
            aria-describedby="space-currency-hint"
            className={SELECT}
          >
            {SUPPORTED_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {currencyLabel(code, locale)}
              </option>
            ))}
          </select>
        </FormField>
        <p id="space-currency-hint" className="text-caption text-muted-foreground">
          {t('currencySoon')}
        </p>
      </div>
      {update.error ? (
        <p role="alert" className="text-caption text-destructive md:col-span-2">
          {te(getErrorCode(update.error))}
        </p>
      ) : null}
      {saved && !changed ? (
        <p role="status" className="text-caption text-success md:col-span-2">
          {t('saved')}
        </p>
      ) : null}
      <Button type="submit" disabled={!changed || update.isPending} className="md:col-start-2">
        {t('save')}
      </Button>
    </form>
  );
}
