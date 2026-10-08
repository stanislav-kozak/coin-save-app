'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCurrentUser, useUpdateMe } from '@/modules/auth';
import { getErrorCode } from '@/shared/lib/api-error';
import { initials } from '@/shared/lib/initials';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { LoadingRegion, Skeleton } from '@/shared/ui/skeleton';
import { SettingsSection } from './settings-section';

const nameSchema = z.object({
  name: z.string().trim().min(1, 'nameRequired').max(100, 'nameTooLong'),
});
type NameInput = z.input<typeof nameSchema>;
type NameValues = z.output<typeof nameSchema>;

/** «Особисті дані»: avatar, name and email. */
export function AccountSection() {
  const t = useTranslations('profile.account');
  const tc = useTranslations('common');
  const me = useCurrentUser();

  return (
    <SettingsSection id="account" title={t('title')}>
      {me.data ? (
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-h2 text-primary-foreground"
          >
            {initials(me.data)}
          </span>
          <span className="min-w-0 truncate text-body text-muted-foreground">{me.data.email}</span>
        </div>
      ) : null}
      {me.data ? (
        // Remount when the saved name changes, so the form starts from it (and isn't dirty).
        <NameForm key={me.data.name ?? ''} name={me.data.name ?? ''} />
      ) : (
        <LoadingRegion label={tc('loading')} className="flex items-center gap-4">
          <Skeleton shape="circle" className="size-14" />
          <Skeleton className="h-4 w-48" />
        </LoadingRegion>
      )}
    </SettingsSection>
  );
}

function NameForm({ name }: { name: string }) {
  const t = useTranslations('profile.account');
  const te = useTranslations('errors');
  const updateMe = useUpdateMe();
  const { register, handleSubmit, formState } = useForm<NameInput, unknown, NameValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name },
  });
  const error = formState.errors.name?.message as 'nameRequired' | 'nameTooLong' | undefined;

  return (
    <form
      noValidate
      onSubmit={(e) => void handleSubmit((values) => updateMe.mutate(values))(e)}
      className="flex flex-col gap-3"
    >
      <FormField id="profile-name" label={t('name')} error={error ? t(error) : undefined}>
        <div className="flex gap-2">
          <Input
            id="profile-name"
            autoComplete="name"
            aria-invalid={!!error}
            aria-describedby={error ? 'profile-name-error' : undefined}
            {...register('name')}
          />
          <Button type="submit" disabled={!formState.isDirty || updateMe.isPending}>
            {t('save')}
          </Button>
        </div>
      </FormField>
      {updateMe.isError ? (
        <p role="alert" className="text-caption text-destructive">
          {te(getErrorCode(updateMe.error))}
        </p>
      ) : null}
    </form>
  );
}
