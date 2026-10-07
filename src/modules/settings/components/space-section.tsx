'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useSpace, useSpaces, useUpdateSpace } from '@/modules/spaces';
import { SUPPORTED_CURRENCIES, currencyLabel, type Currency } from '@/shared/constants/currencies';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { SectionError } from '@/shared/ui/section-error';
import { LoadingRegion, Skeleton } from '@/shared/ui/skeleton';
import { useMyRole } from '../lib/use-my-role';
import { ConfirmDialog } from './confirm-dialog';
import { SettingsSection } from './settings-section';

const schema = z.object({
  name: z.string().trim().min(1, { error: 'nameRequired' }).max(100, { error: 'nameTooLong' }),
  currency: z.enum(SUPPORTED_CURRENCIES),
});
type Values = z.output<typeof schema>;
type Changes = { name?: string; primaryCurrency?: Currency };

const SELECT =
  'h-10 w-full rounded-control border border-input bg-card px-3 text-field md:text-body text-foreground outline-none focus-visible:border-primary';

/** «Простір»: the owner renames it and changes its primary currency (re-converted on the server). */
export function SpaceSection({ spaceId }: { spaceId: string }) {
  const t = useTranslations('settings.space');
  const tc = useTranslations('common');
  const space = useSpace(spaceId);
  const spaces = useSpaces();
  const role = useMyRole(spaceId);
  const failed = (space.isError && !space.isFetching) || (spaces.isError && !spaces.isFetching);
  return (
    <SettingsSection id="space" title={t('title')}>
      {failed ? (
        <SectionError
          error={space.error ?? spaces.error}
          onRetry={() => {
            if (space.isError) void space.refetch();
            if (spaces.isError) void spaces.refetch();
          }}
        />
      ) : !space.data || !role ? (
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
  // A currency change re-converts the whole history on the server: ask first (backend contract).
  const [pending, setPending] = useState<Changes | null>(null);
  const { register, handleSubmit, formState, control } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: space.name, currency: space.primaryCurrency as Currency },
  });
  const [name, currency] = useWatch({ control, name: ['name', 'currency'] });
  const changes = (values: { name: string; currency: Currency }): Changes => ({
    ...(values.name.trim() !== space.name ? { name: values.name.trim() } : {}),
    ...(values.currency !== space.primaryCurrency ? { primaryCurrency: values.currency } : {}),
  });
  const changed = Object.keys(changes({ name, currency })).length > 0;
  const nameError = formState.errors.name?.message;

  const apply = async (body: Changes) => {
    setSaved(false);
    await update.mutateAsync(body);
    setSaved(true);
  };

  const save = async (values: Values) => {
    const body = changes(values);
    if (body.primaryCurrency) return setPending(body);
    try {
      await apply(body);
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
      <FormField id="space-currency" label={t('currency')}>
        <select id="space-currency" className={SELECT} {...register('currency')}>
          {SUPPORTED_CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {currencyLabel(code, locale)}
            </option>
          ))}
        </select>
      </FormField>
      {update.error && !pending ? (
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
        {update.isPending ? t('converting') : t('save')}
      </Button>
      {pending?.primaryCurrency ? (
        <ConfirmDialog
          title={t('confirmCurrencyTitle')}
          text={t('confirmCurrency', { currency: pending.primaryCurrency })}
          confirmLabel={t('currencyConfirm')}
          busyLabel={t('converting')}
          onConfirm={() => apply(pending)}
          onClose={() => setPending(null)}
        />
      ) : null}
    </form>
  );
}
