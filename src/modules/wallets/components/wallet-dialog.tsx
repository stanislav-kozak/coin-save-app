'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { getErrorCode } from '@/shared/lib/api-error';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ColorPicker } from '@/shared/ui/color-picker';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useArchiveWallet, useUpdateWallet } from '../api/wallets-queries';
import { updateWalletSchema, type UpdateWalletValues } from '../schemas';

type ValidationKey = 'nameRequired' | 'nameTooLong' | 'amountInvalid' | 'amountTooLarge';
export type EditableWallet = {
  id: string;
  name: string;
  currency: string;
  color: string | null;
  initialBalance: string;
};
type Props = {
  spaceId: string;
  wallet: EditableWallet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Edit a wallet's name, color and initial balance; archive it (spec §4.3: wallets with history are
 * archived, never deleted). The currency is fixed. Remount (`key`) per wallet for a fresh form.
 */
export function WalletDialog({ spaceId, wallet, open, onOpenChange }: Props) {
  const t = useTranslations('wallets');
  const te = useTranslations('errors');
  const update = useUpdateWallet(spaceId);
  const archive = useArchiveWallet(spaceId);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const busy = update.isPending || archive.isPending;

  const { register, handleSubmit, formState, control } = useForm<
    z.input<typeof updateWalletSchema>,
    unknown,
    UpdateWalletValues
  >({
    resolver: zodResolver(updateWalletSchema),
    defaultValues: {
      name: wallet.name,
      color: wallet.color ?? '#3b82f6',
      initialBalance: wallet.initialBalance,
    },
  });
  const errors = formState.errors;
  const vm = (key?: string) => (key ? t(`validation.${key as ValidationKey}`) : undefined);

  // Not optimistic: rare, and a refusal must show in place.
  const run = async (action: () => Promise<unknown>) => {
    if (busy) return;
    setError(null);
    try {
      await action();
      onOpenChange(false);
    } catch (e) {
      setError(e);
    }
  };

  const alert = error ? (
    <p role="alert" className="text-caption text-destructive">
      {te(getErrorCode(error))}
    </p>
  ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t('edit.title')} closeLabel={t('close')}>
        {confirm ? (
          <div className="flex flex-col gap-4">
            <p className="text-body text-foreground">
              {t('edit.confirmArchive', { name: wallet.name })}
            </p>
            {alert}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirm(false);
                  setError(null);
                }}
              >
                {t('edit.cancel')}
              </Button>
              <Button
                disabled={busy}
                onClick={() => void run(() => archive.mutateAsync(wallet.id))}
              >
                {t('edit.archiveConfirm')}
              </Button>
            </div>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(e) =>
              void handleSubmit((body) => run(() => update.mutateAsync({ id: wallet.id, body })))(e)
            }
            className="flex flex-col gap-4"
          >
            <FormField
              id="wallet-edit-name"
              label={t('create.name')}
              error={vm(errors.name?.message)}
            >
              <Input
                id="wallet-edit-name"
                autoComplete="off"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'wallet-edit-name-error' : undefined}
                {...register('name')}
              />
            </FormField>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <ColorPicker
                  id="wallet-edit-color"
                  label={t('create.color')}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <FormField
              id="wallet-edit-balance"
              label={t('create.initialBalance')}
              error={vm(errors.initialBalance?.message)}
            >
              <div className="flex items-center gap-2">
                <Input
                  id="wallet-edit-balance"
                  inputMode="decimal"
                  autoComplete="off"
                  aria-invalid={!!errors.initialBalance}
                  aria-describedby={errors.initialBalance ? 'wallet-edit-balance-error' : undefined}
                  {...register('initialBalance')}
                />
                <Badge tone="neutral">{wallet.currency}</Badge>
              </div>
            </FormField>
            {alert}
            <Button type="submit" disabled={busy}>
              {t('edit.save')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setConfirm(true)}>
              {t('edit.archive')}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
