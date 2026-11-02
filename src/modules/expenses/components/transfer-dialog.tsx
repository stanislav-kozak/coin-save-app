'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import type { components } from '@/generated/api';
import { useWallets } from '@/modules/wallets';
import { useRate } from '@/shared/hooks/use-rate';
import { getErrorCode } from '@/shared/lib/api-error';
import { changedFields } from '@/shared/lib/changed-fields';
import { amountField, noteField } from '@/shared/lib/form-fields';
import { formatMoney, multiplyMoney } from '@/shared/lib/money';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { LoadingRegion, Skeleton } from '@/shared/ui/skeleton';
import { notify } from '@/shared/ui/toaster';
import {
  useCreateTransfer,
  useDeleteTransfer,
  useUpdateTransfer,
} from '../api/transfers-mutations';

type Currency = components['schemas']['Currency'];

/** A saved transfer, as both record shapes carry it (ExpenseResponseDto, AnalyticsExpenseItemDto). */
export type EditableTransfer = {
  id: string;
  walletId: string;
  toWalletId: string | null;
  amount: string;
  toAmount: string | null;
  walletCurrency: string;
  toWalletCurrency: string | null;
  note: string | null;
  occurredAt: string;
};

const pad = (n: number) => String(n).padStart(2, '0');
/** A Date → `datetime-local` value in the user's own time. */
const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Messages are keys of `transfers.validation`.
const schema = z
  .object({
    fromWalletId: z.string().min(1, { error: 'walletRequired' }),
    toWalletId: z.string().min(1, { error: 'walletRequired' }),
    amount: amountField,
    // Only asked for between two currencies; empty means "convert at the rate of the day".
    toAmount: z.union([z.literal('').transform(() => undefined), amountField]),
    // The server allows up to 5 minutes ahead (clock skew); anything later is a typo.
    occurredAt: z
      .string()
      .refine((v) => !Number.isNaN(new Date(v).getTime()), { error: 'dateInvalid', abort: true })
      .refine((v) => new Date(v).getTime() <= Date.now() + 60_000, { error: 'dateInFuture' })
      .transform((v) => new Date(v).toISOString()),
    note: noteField,
  })
  .refine((v) => v.fromWalletId !== v.toWalletId, {
    path: ['toWalletId'],
    error: 'sameWallet',
  });
type Values = z.output<typeof schema>;
type FormInput = z.input<typeof schema>;
type ValidationKey =
  | 'walletRequired'
  | 'sameWallet'
  | 'amountRequired'
  | 'amountInvalid'
  | 'amountPositive'
  | 'amountTooLarge'
  | 'noteTooLong'
  | 'dateInvalid'
  | 'dateInFuture';

const SELECT =
  'h-10 w-full rounded-control border border-input bg-card px-3 text-field md:text-body text-foreground outline-none focus-visible:border-primary';

type Props = {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** New transfer: the wallets chosen by a drag or a button. */
  prefill?: { fromWalletId?: string; toWalletId?: string };
  /** Edit (and delete) this transfer instead. Remount (`key`) per target. */
  transfer?: EditableTransfer;
};

/**
 * «Переказ» between two wallets. Between currencies the received amount is optional: left empty, the
 * server converts at the rate of the transfer's date (the field shows today's estimate). Not
 * optimistic, so both balances come out exact.
 */
export function TransferDialog({ spaceId, open, onOpenChange, prefill, transfer }: Props) {
  const t = useTranslations('transfers');
  const tt = useTranslations('toasts');
  const te = useTranslations('errors');
  const tc = useTranslations('common');
  const locale = useLocale();
  // Incl. archived: an old transfer may involve one; only active ones are offered otherwise.
  const wallets = useWallets(spaceId, { includeArchived: true });
  const create = useCreateTransfer(spaceId);
  const update = useUpdateTransfer(spaceId);
  const remove = useDeleteTransfer(spaceId);
  const [error, setError] = useState<unknown>(null);
  const [confirm, setConfirm] = useState(false);
  const [now] = useState(() => new Date());

  const { register, handleSubmit, formState, control } = useForm<FormInput, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromWalletId: transfer?.walletId ?? prefill?.fromWalletId ?? '',
      toWalletId: transfer?.toWalletId ?? prefill?.toWalletId ?? '',
      amount: transfer?.amount ?? '',
      toAmount:
        transfer && transfer.toWalletCurrency !== transfer.walletCurrency
          ? (transfer.toAmount ?? '')
          : '',
      occurredAt: toLocalInput(transfer ? new Date(transfer.occurredAt) : now),
      note: transfer?.note ?? '',
    },
  });
  const errors = formState.errors;
  // Read during render: react-hook-form only tracks the formState fields a component subscribes to.
  const { dirtyFields } = formState;
  const vm = (key?: string) => (key ? t(`validation.${key as ValidationKey}`) : undefined);

  const [fromId, toId, amount] = useWatch({
    control,
    name: ['fromWalletId', 'toWalletId', 'amount'],
  });
  const keep = (id: string) => (w: { id: string; archived: boolean }) => !w.archived || w.id === id;
  const from = wallets.data?.find((w) => w.id === fromId);
  const to = wallets.data?.find((w) => w.id === toId);
  const crossCurrency = !!from && !!to && from.currency !== to.currency;
  const rate = useRate(
    (from?.currency ?? 'UAH') as Currency,
    ((crossCurrency ? to?.currency : from?.currency) ?? 'UAH') as Currency,
  );
  const parsedAmount = amountField.safeParse(amount ?? '');
  const estimate =
    crossCurrency && rate.data && parsedAmount.success
      ? formatMoney(multiplyMoney(String(parsedAmount.data), rate.data.rate), to.currency, locale)
      : null;

  const save = async (values: Values) => {
    setError(null);
    try {
      if (transfer) {
        const { fromWalletId, toWalletId, amount, toAmount, occurredAt, note } = changedFields(
          values,
          dirtyFields,
        );
        await update.mutateAsync({
          id: transfer.id,
          body: {
            ...(fromWalletId ? { fromWalletId } : {}),
            ...(toWalletId ? { toWalletId } : {}),
            ...(amount !== undefined ? { amount } : {}),
            // A cleared received amount isn't sent: the server converts again if the amount or a
            // wallet changed, and keeps it otherwise.
            ...(crossCurrency && toAmount !== undefined ? { toAmount } : {}),
            ...(occurredAt ? { occurredAt } : {}),
            ...(dirtyFields.note ? { note: note ?? null } : {}),
          },
        });
      } else {
        await create.mutateAsync({
          fromWalletId: values.fromWalletId,
          toWalletId: values.toWalletId,
          amount: values.amount,
          ...(crossCurrency && values.toAmount !== undefined ? { toAmount: values.toAmount } : {}),
          occurredAt: values.occurredAt,
          ...(values.note ? { note: values.note } : {}),
        });
      }
      notify(tt('transferSaved'));
      onOpenChange(false);
    } catch (e) {
      setError(e);
    }
  };

  if (confirm && transfer) {
    return (
      <ConfirmDialog
        title={t('deleteTitle')}
        text={t('confirmDelete')}
        confirmLabel={t('delete')}
        tone="danger"
        onConfirm={async () => {
          await remove.mutateAsync(transfer.id);
          notify(tt('deleted'));
          onOpenChange(false);
        }}
        onClose={() => setConfirm(false)}
      />
    );
  }

  const busy = create.isPending || update.isPending;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={transfer ? t('editTitle') : t('title')} closeLabel={tc('close')}>
        {/* Selects take their value when mounted: wait for the list so they show the chosen ones. */}
        {!wallets.data ? (
          <LoadingRegion label={tc('loading')} className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </LoadingRegion>
        ) : (
          <form
            noValidate
            onSubmit={(e) => void handleSubmit(save)(e)}
            className="flex flex-col gap-4"
          >
            <FormField
              id="transfer-from"
              label={t('from')}
              error={vm(errors.fromWalletId?.message)}
            >
              <select id="transfer-from" className={SELECT} {...register('fromWalletId')}>
                <option value="" disabled>
                  {t('choose')}
                </option>
                {wallets.data.filter(keep(transfer?.walletId ?? '')).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} · {w.currency}
                    {w.archived ? ` ${t('archived')}` : ''}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="transfer-to" label={t('to')} error={vm(errors.toWalletId?.message)}>
              <select id="transfer-to" className={SELECT} {...register('toWalletId')}>
                <option value="" disabled>
                  {t('choose')}
                </option>
                {wallets.data
                  .filter(keep(transfer?.toWalletId ?? ''))
                  .filter((w) => w.id !== fromId || w.id === toId)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} · {w.currency}
                      {w.archived ? ` ${t('archived')}` : ''}
                    </option>
                  ))}
              </select>
            </FormField>
            <FormField id="transfer-amount" label={t('amount')} error={vm(errors.amount?.message)}>
              <div className="flex items-center gap-2">
                <Input
                  id="transfer-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? 'transfer-amount-error' : undefined}
                  {...register('amount')}
                />
                {from ? <Badge tone="neutral">{from.currency}</Badge> : null}
              </div>
            </FormField>
            {crossCurrency ? (
              <FormField
                id="transfer-to-amount"
                label={t('toAmount')}
                error={vm(errors.toAmount?.message)}
              >
                <div className="flex items-center gap-2">
                  <Input
                    id="transfer-to-amount"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={estimate ? t('estimate', { amount: estimate }) : '0.00'}
                    aria-invalid={!!errors.toAmount}
                    aria-describedby="transfer-to-amount-hint"
                    {...register('toAmount')}
                  />
                  <Badge tone="neutral">{to.currency}</Badge>
                </div>
                <p id="transfer-to-amount-hint" className="text-caption text-muted-foreground">
                  {t('toAmountHint')}
                </p>
              </FormField>
            ) : null}
            <FormField id="transfer-when" label={t('when')} error={vm(errors.occurredAt?.message)}>
              <Input
                id="transfer-when"
                type="datetime-local"
                aria-invalid={!!errors.occurredAt}
                aria-describedby={errors.occurredAt ? 'transfer-when-error' : undefined}
                {...register('occurredAt')}
              />
            </FormField>
            <FormField id="transfer-note" label={t('note')} error={vm(errors.note?.message)}>
              <Input id="transfer-note" autoComplete="off" {...register('note')} />
            </FormField>
            {error ? (
              <p role="alert" className="text-caption text-destructive">
                {te(getErrorCode(error))}
              </p>
            ) : null}
            <Button type="submit" disabled={busy}>
              {transfer ? t('save') : t('submit')}
            </Button>
            {transfer ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                onClick={() => setConfirm(true)}
              >
                {t('delete')}
              </Button>
            ) : null}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
