'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import type { z } from 'zod';
import { SUPPORTED_CURRENCIES, currencyLabel, type Currency } from '@/shared/constants/currencies';
import { useRate } from '@/shared/hooks/use-rate';
import { getErrorCode } from '@/shared/lib/api-error';
import { changedFields } from '@/shared/lib/changed-fields';
import { formatMoney, multiplyMoney } from '@/shared/lib/money';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ColorPicker } from '@/shared/ui/color-picker';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useArchiveWallet, useUpdateWallet } from '../api/wallets-queries';
import { updateWalletSchema, type UpdateWalletValues } from '../schemas';
import { CurrencyPreview } from './currency-preview';

type ValidationKey = 'nameRequired' | 'nameTooLong' | 'amountInvalid' | 'amountTooLarge';
export type EditableWallet = {
  id: string;
  name: string;
  currency: string;
  color: string | null;
  initialBalance: string;
  balance: string;
};
type Body = Partial<UpdateWalletValues>;
type Props = {
  spaceId: string;
  wallet: EditableWallet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SELECT =
  'h-10 w-full rounded-control border border-input bg-card px-3 text-field md:text-body text-foreground outline-none focus-visible:border-primary';

/**
 * Edit a wallet's name, color, initial balance and currency; archive it (spec §4.3: wallets with
 * history are archived, never deleted). A new currency converts the whole wallet at today's rate on
 * the server, after a confirmation. Remount (`key`) per wallet for a fresh form.
 */
export function WalletDialog({ spaceId, wallet, open, onOpenChange }: Props) {
  const t = useTranslations('wallets');
  const te = useTranslations('errors');
  const locale = useLocale();
  // The response types the code as a plain string; it's always one of the supported ones.
  const walletCurrency = wallet.currency as Currency;
  const update = useUpdateWallet(spaceId);
  const archive = useArchiveWallet(spaceId);
  // Archiving, or a currency change waiting with its body: both ask first.
  const [confirm, setConfirm] = useState<null | 'archive' | Body>(null);
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
      color: wallet.color ?? '',
      initialBalance: wallet.initialBalance,
      currency: walletCurrency,
    },
  });
  const currency = useWatch({ control, name: 'currency' });
  const changing = currency !== walletCurrency;
  const rate = useRate(walletCurrency, currency);
  const converted = rate.data ? multiplyMoney(wallet.balance, rate.data.rate) : null;
  const errors = formState.errors;
  // Read during render: react-hook-form only tracks the formState fields a component subscribes to.
  const { dirtyFields } = formState;
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
        {confirm && confirm !== 'archive' ? (
          <div className="flex flex-col gap-4">
            <p className="text-body text-foreground">
              {t('edit.confirmCurrency', {
                name: wallet.name,
                from: formatMoney(wallet.balance, walletCurrency, locale),
                to: converted ? formatMoney(converted, currency, locale) : currency,
              })}
            </p>
            {alert}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirm(null);
                  setError(null);
                }}
              >
                {t('edit.cancel')}
              </Button>
              <Button
                disabled={busy}
                onClick={() => void run(() => update.mutateAsync({ id: wallet.id, body: confirm }))}
              >
                {t('edit.currencyConfirm')}
              </Button>
            </div>
          </div>
        ) : confirm === 'archive' ? (
          <div className="flex flex-col gap-4">
            <p className="text-body text-foreground">
              {t('edit.confirmArchive', { name: wallet.name })}
            </p>
            {alert}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirm(null);
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
              void handleSubmit((values) => {
                const body: Body = changedFields(values, dirtyFields);
                if (!changing) {
                  delete body.currency;
                  return run(() => update.mutateAsync({ id: wallet.id, body }));
                }
                // The server converts the balance; the API refuses both at once.
                delete body.initialBalance;
                setError(null);
                setConfirm({ ...body, currency });
              })(e)
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
                {changing ? (
                  // Converted with the rest of the wallet: shown as stored, not editable.
                  <Input
                    key="locked"
                    id="wallet-edit-balance"
                    disabled
                    value={wallet.initialBalance}
                    readOnly
                    aria-describedby="wallet-edit-balance-hint"
                  />
                ) : (
                  <Input
                    key="editable"
                    id="wallet-edit-balance"
                    inputMode="decimal"
                    autoComplete="off"
                    aria-invalid={!!errors.initialBalance}
                    aria-describedby={
                      errors.initialBalance ? 'wallet-edit-balance-error' : undefined
                    }
                    {...register('initialBalance')}
                  />
                )}
                <Badge tone="neutral">{wallet.currency}</Badge>
              </div>
            </FormField>
            {changing ? (
              <p id="wallet-edit-balance-hint" className="-mt-2 text-caption text-muted-foreground">
                {t('currency.balanceLocked')}
              </p>
            ) : null}
            <FormField id="wallet-edit-currency" label={t('currency.label')}>
              <select id="wallet-edit-currency" className={SELECT} {...register('currency')}>
                {SUPPORTED_CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {currencyLabel(code, locale)}
                  </option>
                ))}
              </select>
            </FormField>
            <CurrencyPreview balance={wallet.balance} from={walletCurrency} to={currency} />
            {alert}
            <Button type="submit" disabled={busy || (changing && !rate.data)}>
              {t('edit.save')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setConfirm('archive')}>
              {t('edit.archive')}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
