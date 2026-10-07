'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { components } from '@/generated/api';
import { nextMonthStart, useCreateRecurring } from '@/modules/recurring';
import { useWallets } from '@/modules/wallets';
import { getErrorCode } from '@/shared/lib/api-error';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useCreateExpense } from '../api/expenses-mutations';
import { incomeSchema, type IncomeDraft, type IncomeFormInput } from '../income-schema';

type CreateRecurring = components['schemas']['CreateRecurringTransactionDto'];
type ValidationKey =
  | 'amountRequired'
  | 'amountInvalid'
  | 'amountPositive'
  | 'amountTooLarge'
  | 'noteTooLong'
  | 'nameRequired'
  | 'nameTooLong';
type Props = {
  spaceId: string;
  walletId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EMPTY: IncomeFormInput = { amount: '', note: '', monthly: false, name: '' };

/**
 * "Новий дохід" from a wallet's "+" (spec §6.3): no category; "Щомісяця" adds the income now and a
 * monthly rule from next month (the backend doesn't create the current month's transaction itself).
 */
export function IncomeDialog({ spaceId, walletId, open, onOpenChange }: Props) {
  const t = useTranslations('expenses');
  const te = useTranslations('errors');
  const wallets = useWallets(spaceId);
  const create = useCreateExpense(spaceId);
  const recurring = useCreateRecurring(spaceId);
  const [submitError, setSubmitError] = useState<unknown>(null);
  // 'recurring': the income was saved but its monthly rule wasn't — submitting retries only the rule.
  const [stage, setStage] = useState<'form' | 'recurring'>('form');
  const pendingRule = useRef<CreateRecurring | null>(null);
  // A failed save reopens for the wallet it was for, even if another wallet's "+" was pressed since.
  const [restoredWallet, setRestoredWallet] = useState<string | null>(null);
  // The moment this form was opened: the "Щомісяця, N-го" label and the rule both use its date, so
  // midnight passing while the dialog is open can't make them disagree.
  const [openedAt, setOpenedAt] = useState(() => new Date());
  const activeWallet = restoredWallet ?? walletId;
  const submitting = useRef(false); // one submit per opening (Enter twice)
  const restoring = useRef(false); // the next open shows a failed save, not a fresh form
  const isOpen = useRef(open);
  useEffect(() => {
    isOpen.current = open;
  }, [open]);

  const { register, handleSubmit, formState, reset, control, setFocus, getValues } = useForm<
    IncomeFormInput,
    unknown,
    IncomeDraft
  >({ resolver: zodResolver(incomeSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    submitting.current = false;
    if (restoring.current) {
      restoring.current = false;
      return;
    }
    setSubmitError(null);
    setRestoredWallet(null);
    setOpenedAt(new Date());
    setStage('form');
    pendingRule.current = null;
    reset(EMPTY);
    setTimeout(() => setFocus('amount'), 0); // after Radix moves focus into the dialog
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog (re)opens
  }, [open, walletId]);

  const monthly = useWatch({ control, name: 'monthly' });
  const wallet = wallets.data?.find((w) => w.id === activeWallet);
  const day = openedAt.getDate();
  const errors = formState.errors;
  const vm = (key?: string) => (key ? t(`validation.${key as ValidationKey}`) : undefined);

  const reopen = (
    error: unknown,
    values: IncomeFormInput,
    nextStage: 'form' | 'recurring',
    forWallet: string,
  ) => {
    restoring.current = !isOpen.current;
    setRestoredWallet(forWallet);
    // A fast answer can reopen before the close ever rendered (no open effect runs), so unlock here.
    submitting.current = false;
    reset(values);
    setStage(nextStage);
    setSubmitError(error);
    onOpenChange(true);
  };

  const saveRule = async (rule: CreateRecurring, values: IncomeFormInput) => {
    try {
      await recurring.mutateAsync(rule);
    } catch (error) {
      pendingRule.current = rule;
      reopen(error, values, 'recurring', rule.walletId);
    }
  };

  // The fields are locked (and so not validated) here: only the saved rule is sent again.
  const retryRule = () => {
    if (submitting.current || !pendingRule.current) return;
    submitting.current = true;
    onOpenChange(false);
    void saveRule(pendingRule.current, getValues());
  };

  const submit = async (draft: IncomeDraft) => {
    if (submitting.current) return;
    submitting.current = true;
    const values = getValues();
    const target = activeWallet;
    onOpenChange(false); // optimistic: the balance already shows the income (spec §6.9)
    try {
      await create.mutateAsync({
        walletId: target,
        amount: draft.amount,
        note: draft.note,
        type: 'INCOME',
        occurredAt: openedAt, // the same moment the monthly rule is based on
      });
    } catch (error) {
      reopen(error, values, 'form', target);
      return;
    }
    if (!draft.monthly) return;
    const now = openedAt;
    await saveRule(
      {
        walletId: target,
        type: 'INCOME',
        amount: draft.amount,
        name: draft.name,
        ...(draft.note ? { note: draft.note } : {}),
        frequency: 'MONTHLY',
        dayOfMonth: now.getDate(),
        startDate: nextMonthStart(now),
      },
      values,
    );
  };

  const locked = stage === 'recurring';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t('income.title')} closeLabel={t('create.close')}>
        <form
          noValidate
          onSubmit={(e) => {
            if (!locked) return void handleSubmit(submit)(e);
            e.preventDefault();
            retryRule();
          }}
          className="flex flex-col gap-4"
        >
          <p className="text-body text-muted-foreground">
            {t('create.wallet')}: <span className="text-foreground">{wallet?.name}</span>
          </p>
          <FormField
            id="income-amount"
            label={t('create.amount')}
            error={vm(errors.amount?.message)}
          >
            <div className="flex items-center gap-2">
              <Input
                id="income-amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                disabled={locked}
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'income-amount-error' : undefined}
                {...register('amount')}
              />
              {wallet ? <Badge tone="neutral">{wallet.currency}</Badge> : null}
            </div>
          </FormField>
          <FormField id="income-note" label={t('create.note')} error={vm(errors.note?.message)}>
            <Input
              id="income-note"
              autoComplete="off"
              placeholder={t('create.notePlaceholder')}
              disabled={locked}
              aria-invalid={!!errors.note}
              {...register('note')}
            />
          </FormField>
          <label className="flex items-center gap-2 text-body text-foreground">
            <input
              type="checkbox"
              disabled={locked}
              className="size-4 accent-primary"
              {...register('monthly')}
            />
            {t('income.monthly', { day })}
          </label>
          {monthly ? (
            <FormField id="income-name" label={t('income.name')} error={vm(errors.name?.message)}>
              <Input
                id="income-name"
                autoComplete="off"
                placeholder={t('income.namePlaceholder')}
                disabled={locked}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'income-name-error' : undefined}
                {...register('name')}
              />
            </FormField>
          ) : null}
          {submitError ? (
            <p role="alert" className="text-caption text-destructive">
              {locked ? `${t('income.recurringFailed')} ` : null}
              {te(getErrorCode(submitError))}
            </p>
          ) : null}
          <Button type="submit">{locked ? t('income.retryRecurring') : t('create.submit')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
