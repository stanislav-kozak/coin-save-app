'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  currencyLabel,
} from '@/shared/constants/currencies';
import { firstUnusedColor } from '@/shared/constants/entity-colors';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { ColorPicker } from '@/shared/ui/color-picker';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useCreateWallet, useWallets } from '../api/wallets-queries';
import { createWalletSchema, type CreateWalletValues } from '../schemas';

type ValidationKey = 'nameRequired' | 'nameTooLong' | 'amountInvalid' | 'amountTooLarge';
type Props = { spaceId: string; open: boolean; onOpenChange: (open: boolean) => void };

export function CreateWalletDialog({ spaceId, open, onOpenChange }: Props) {
  const t = useTranslations('wallets');
  const te = useTranslations('errors');
  const locale = useLocale();
  const create = useCreateWallet(spaceId);
  const wallets = useWallets(spaceId);
  const defaultColor = firstUnusedColor(wallets.data?.map((w) => w.color) ?? []);
  const { register, handleSubmit, formState, reset, control, getFieldState, setValue } = useForm<
    z.input<typeof createWalletSchema>,
    unknown,
    CreateWalletValues
  >({
    resolver: zodResolver(createWalletSchema),
    defaultValues: {
      name: '',
      currency: DEFAULT_CURRENCY,
      initialBalance: '',
      color: defaultColor,
    },
  });

  // Each opening starts clean…
  useEffect(() => {
    if (open)
      reset({ name: '', currency: DEFAULT_CURRENCY, initialBalance: '', color: defaultColor });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on (re)open, not on every refetch
  }, [open]);
  // …and follows the wallets list (loaded late, or changed by a family member) only while the user
  // hasn't picked a color, never touching what they typed.
  useEffect(() => {
    if (open && !getFieldState('color').isDirty) setValue('color', defaultColor);
  }, [open, defaultColor, getFieldState, setValue]);
  const errors = formState.errors;
  const vm = (key?: string) => (key ? t(`validation.${key as ValidationKey}`) : undefined);

  const onSubmit = handleSubmit(async (values) => {
    if (create.isPending) return;
    try {
      await create.mutateAsync(values);
      reset();
      create.reset();
      onOpenChange(false);
    } catch {
      // shown below via create.error
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t('create.title')} closeLabel={t('close')}>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField id="wallet-name" label={t('create.name')} error={vm(errors.name?.message)}>
            <Input
              id="wallet-name"
              autoComplete="off"
              placeholder={t('create.namePlaceholder')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'wallet-name-error' : undefined}
              {...register('name')}
            />
          </FormField>
          <FormField id="wallet-currency" label={t('create.currency')}>
            <select
              id="wallet-currency"
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
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <ColorPicker
                id="wallet-color"
                label={t('create.color')}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FormField
            id="wallet-balance"
            label={t('create.initialBalance')}
            error={vm(errors.initialBalance?.message)}
          >
            <Input
              id="wallet-balance"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              aria-invalid={!!errors.initialBalance}
              aria-describedby={errors.initialBalance ? 'wallet-balance-error' : undefined}
              {...register('initialBalance')}
            />
          </FormField>
          {create.error ? (
            <p role="alert" className="text-caption text-destructive">
              {te(getErrorCode(create.error))}
            </p>
          ) : null}
          <Button type="submit" disabled={create.isPending}>
            {t('create.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
