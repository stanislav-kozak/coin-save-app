'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { components } from '@/generated/api';
import { useCategories } from '@/modules/categories';
import { useWallets } from '@/modules/wallets';
import { getErrorCode } from '@/shared/lib/api-error';
import { changedFields } from '@/shared/lib/changed-fields';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { LoadingRegion, Skeleton } from '@/shared/ui/skeleton';
import { useCreateRecurring, useUpdateRecurring } from '../api/recurring-mutations';
import { firstPaymentDate } from '../lib/first-payment-date';
import { recurringFormSchema, type RecurringFormInput, type RecurringFormValues } from '../schemas';

type Rule = components['schemas']['RecurringTransactionResponseDto'];
type ValidationKey =
  | 'nameRequired'
  | 'nameTooLong'
  | 'amountRequired'
  | 'amountInvalid'
  | 'amountPositive'
  | 'amountTooLarge'
  | 'noteTooLong'
  | 'walletRequired'
  | 'endBeforeStart';
type Props = {
  spaceId: string;
  /** Edit this rule; without it the dialog creates one. Remount (`key`) per target. */
  rule?: Pick<
    Rule,
    | 'id'
    | 'type'
    | 'name'
    | 'amount'
    | 'walletId'
    | 'categoryId'
    | 'dayOfMonth'
    | 'startDate'
    | 'endDate'
    | 'note'
  >;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
};

const SELECT =
  'h-10 w-full rounded-control border border-input bg-card px-3 text-field md:text-body text-foreground outline-none focus-visible:border-primary';
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

/** Create/edit a monthly rule (spec §7.6). Not optimistic: nothing is on screen until it's saved. */
export function RecurringDialog({ spaceId, rule, open, onOpenChange, onDelete }: Props) {
  const t = useTranslations('recurring');
  const te = useTranslations('errors');
  const tc = useTranslations('common');
  const locale = useLocale();
  // Incl. archived: a rule may still point at one, and the select must show it (marked) rather than
  // silently display another option. Only active ones are offered otherwise.
  const wallets = useWallets(spaceId, { includeArchived: true });
  const categories = useCategories(spaceId, { includeArchived: true });
  const create = useCreateRecurring(spaceId);
  const update = useUpdateRecurring(spaceId);
  const [error, setError] = useState<unknown>(null);
  const [now] = useState(() => new Date());
  const busy = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    formState,
    control,
    setValue,
    getValues,
    setError: setFieldError,
  } = useForm<RecurringFormInput, unknown, RecurringFormValues>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues: {
      type: rule?.type ?? 'EXPENSE',
      name: rule?.name ?? '',
      amount: rule?.amount ?? '',
      walletId: rule?.walletId ?? '',
      categoryId: rule?.categoryId ?? '',
      dayOfMonth: String(rule?.dayOfMonth ?? now.getDate()),
      endDate: rule?.endDate?.slice(0, 10) ?? '',
      note: rule?.note ?? '',
    },
  });
  const errors = formState.errors;
  // Read during render: react-hook-form only tracks the formState fields a component subscribes to.
  const { dirtyFields } = formState;
  const vm = (key?: string) => (key ? t(`validation.${key as ValidationKey}`) : undefined);

  // A new rule starts on the first wallet once the list arrives.
  const firstWalletId = wallets.data?.find((w) => !w.archived)?.id;
  useEffect(() => {
    if (!rule && firstWalletId && !getValues('walletId')) setValue('walletId', firstWalletId);
  }, [rule, firstWalletId, getValues, setValue]);

  const [type, walletId, day] = useWatch({ control, name: ['type', 'walletId', 'dayOfMonth'] });
  const wallet = wallets.data?.find((w) => w.id === walletId);
  const start = rule ? rule.startDate.slice(0, 10) : firstPaymentDate(Number(day), now);
  const startLabel = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(
    new Date(`${start}T00:00:00`),
  );

  const save = async (values: RecurringFormValues) => {
    if (values.endDate && values.endDate < start) {
      setFieldError('endDate', { message: 'endBeforeStart' });
      return;
    }
    setError(null);
    try {
      if (rule) {
        const changed = changedFields(values, dirtyFields);
        delete changed.type; // can't change on edit (not in the update DTO)
        // A cleared note parses to undefined, which JSON drops; '' is what removes it.
        if (dirtyFields.note && values.note === undefined) changed.note = '';
        await update.mutateAsync({ id: rule.id, body: changed });
      } else {
        const { categoryId, endDate, note, ...rest } = values;
        await create.mutateAsync({
          ...rest,
          ...(values.type === 'EXPENSE' && categoryId ? { categoryId } : {}),
          frequency: 'MONTHLY',
          startDate: start,
          ...(endDate ? { endDate } : {}),
          ...(note ? { note } : {}),
        });
      }
      onOpenChange(false);
    } catch (e) {
      setError(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={rule ? t('form.editTitle') : t('form.createTitle')}
        closeLabel={tc('close')}
      >
        {/* Selects take their value when mounted: wait for the lists so they show the rule's own. */}
        {!wallets.data || !categories.data ? (
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
            {rule ? null : (
              <div role="radiogroup" aria-label={t('form.type')} className="flex gap-2">
                {(['EXPENSE', 'INCOME'] as const).map((value) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      value={value}
                      className="peer sr-only"
                      {...register('type')}
                    />
                    <span
                      className={cn(
                        'block rounded-full border px-4 py-1 text-caption font-semibold peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50',
                        type === value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-foreground',
                      )}
                    >
                      {t(value === 'EXPENSE' ? 'form.expense' : 'form.income')}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <FormField id="recurring-name" label={t('form.name')} error={vm(errors.name?.message)}>
              <Input
                id="recurring-name"
                autoComplete="off"
                placeholder={t('form.namePlaceholder')}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'recurring-name-error' : undefined}
                {...register('name')}
              />
            </FormField>
            <FormField
              id="recurring-amount"
              label={t('form.amount')}
              error={vm(errors.amount?.message)}
            >
              <div className="flex items-center gap-2">
                <Input
                  id="recurring-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? 'recurring-amount-error' : undefined}
                  {...register('amount')}
                />
                {wallet ? <Badge tone="neutral">{wallet.currency}</Badge> : null}
              </div>
            </FormField>
            <FormField
              id="recurring-wallet"
              label={t('form.wallet')}
              error={vm(errors.walletId?.message)}
            >
              <select id="recurring-wallet" className={SELECT} {...register('walletId')}>
                {wallets.data
                  ?.filter((w) => !w.archived || w.id === rule?.walletId)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} · {w.currency}
                      {w.archived ? ` ${t('form.archived')}` : ''}
                    </option>
                  ))}
              </select>
            </FormField>
            {type === 'EXPENSE' ? (
              <FormField id="recurring-category" label={t('form.category')}>
                <select id="recurring-category" className={SELECT} {...register('categoryId')}>
                  <option value="">{t('form.noCategory')}</option>
                  {categories.data
                    ?.filter((c) => !c.archived || c.id === rule?.categoryId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                        {c.archived ? ` ${t('form.archived')}` : ''}
                      </option>
                    ))}
                </select>
              </FormField>
            ) : null}
            <FormField id="recurring-day" label={t('form.day')}>
              <select id="recurring-day" className={SELECT} {...register('dayOfMonth')}>
                {DAYS.map((d) => (
                  <option key={d} value={String(d)}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>
            {Number(day) >= 29 ? (
              <p className="-mt-2 text-caption text-muted-foreground">{t('form.shortMonths')}</p>
            ) : null}
            {rule ? null : (
              <p className="text-body text-muted-foreground">
                {t('form.firstPayment', { date: startLabel })}
              </p>
            )}
            <FormField
              id="recurring-end"
              label={t('form.endDate')}
              error={vm(errors.endDate?.message)}
            >
              <Input
                id="recurring-end"
                type="date"
                aria-invalid={!!errors.endDate}
                aria-describedby={errors.endDate ? 'recurring-end-error' : undefined}
                {...register('endDate')}
              />
            </FormField>
            <FormField id="recurring-note" label={t('form.note')} error={vm(errors.note?.message)}>
              <Input id="recurring-note" autoComplete="off" {...register('note')} />
            </FormField>
            {error ? (
              <p role="alert" className="text-caption text-destructive">
                {te(getErrorCode(error))}
              </p>
            ) : null}
            <Button type="submit" disabled={busy}>
              {t('form.save')}
            </Button>
            {rule && onDelete ? (
              <Button type="button" variant="ghost" className="text-destructive" onClick={onDelete}>
                {t('form.delete')}
              </Button>
            ) : null}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
