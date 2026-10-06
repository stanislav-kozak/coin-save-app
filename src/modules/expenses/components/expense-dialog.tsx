'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useCategories } from '@/modules/categories';
import { useWallets } from '@/modules/wallets';
import { getErrorCode } from '@/shared/lib/api-error';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useCreateExpense } from '../api/expenses-mutations';
import { createExpenseSchema, type ExpenseDraft, type ExpenseFormInput } from '../schemas';

type ValidationKey =
  'amountRequired' | 'amountInvalid' | 'amountPositive' | 'amountTooLarge' | 'noteTooLong';
type Props = {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Wallet and category chosen by drag-and-drop; without it the user picks them. */
  prefill?: { walletId: string; categoryId: string };
};

const SELECT =
  'h-10 w-full rounded-control border border-input bg-card px-3 text-body text-foreground outline-none focus-visible:border-primary';

/** "Нова витрата" (Figma 10:176). Closes on submit; reopens with the same values if the server refuses. */
export function ExpenseDialog({ spaceId, open, onOpenChange, prefill }: Props) {
  const t = useTranslations('expenses');
  const te = useTranslations('errors');
  const wallets = useWallets(spaceId);
  const categories = useCategories(spaceId);
  const create = useCreateExpense(spaceId);
  const submitting = useRef(false);
  const reopenedAfterError = useRef(false);

  const { register, handleSubmit, formState, reset, control, setFocus, setValue, getValues } =
    useForm<ExpenseFormInput, unknown, ExpenseDraft>({
      resolver: zodResolver(createExpenseSchema),
    });

  // A fresh open (new drop / FAB) starts clean; reopening after a failure keeps what was typed.
  useEffect(() => {
    if (!open) return;
    if (reopenedAfterError.current) {
      reopenedAfterError.current = false;
      return;
    }
    create.reset();
    reset({
      walletId: prefill?.walletId ?? wallets.data?.[0]?.id ?? '',
      categoryId: prefill?.categoryId ?? '',
      amount: '',
      note: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog (re)opens
  }, [open, prefill?.walletId, prefill?.categoryId]);

  useEffect(() => {
    if (open) setTimeout(() => setFocus('amount'), 0); // after Radix moves focus into the dialog
  }, [open, setFocus]);

  // Opened before wallets loaded (e.g. the FAB right after navigation): preselect the first one then.
  const firstWalletId = wallets.data?.[0]?.id;
  useEffect(() => {
    if (open && firstWalletId && !getValues('walletId')) setValue('walletId', firstWalletId);
  }, [open, firstWalletId, getValues, setValue]);

  const walletId = useWatch({ control, name: 'walletId' });
  const wallet = wallets.data?.find((w) => w.id === walletId);
  const category = categories.data?.find((c) => c.id === prefill?.categoryId);
  const errors = formState.errors;
  const vm = (key?: string) => (key ? t(`validation.${key as ValidationKey}`) : undefined);

  const submit = (draft: ExpenseDraft) => {
    if (submitting.current) return;
    submitting.current = true;
    onOpenChange(false); // optimistic: the result is already on screen (spec §6.9)
    create.mutate(
      { ...draft, categoryId: draft.categoryId || undefined },
      {
        onError: () => {
          reopenedAfterError.current = true;
          onOpenChange(true);
        },
        onSettled: () => {
          submitting.current = false;
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t('create.title')} closeLabel={t('create.close')}>
        <form
          noValidate
          onSubmit={(e) => void handleSubmit(submit)(e)}
          className="flex flex-col gap-4"
        >
          {prefill ? (
            <dl className="flex flex-col gap-1 text-body text-muted-foreground">
              <div>
                <dt className="inline">{t('create.wallet')}: </dt>
                <dd className="inline text-foreground">{wallet?.name}</dd>
              </div>
              <div>
                <dt className="inline">{t('create.category')}: </dt>
                <dd className="inline text-foreground">{category?.name}</dd>
              </div>
            </dl>
          ) : (
            <>
              <FormField id="expense-wallet" label={t('create.wallet')}>
                <select id="expense-wallet" className={SELECT} {...register('walletId')}>
                  {wallets.data?.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} · {w.currency}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField id="expense-category" label={t('create.category')}>
                <select id="expense-category" className={SELECT} {...register('categoryId')}>
                  {categories.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                  <option value="">{t('create.noCategory')}</option>
                </select>
              </FormField>
            </>
          )}
          <FormField
            id="expense-amount"
            label={t('create.amount')}
            error={vm(errors.amount?.message)}
          >
            <div className="flex items-center gap-2">
              <Input
                id="expense-amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'expense-amount-error' : undefined}
                {...register('amount')}
              />
              {wallet ? <Badge tone="neutral">{wallet.currency}</Badge> : null}
            </div>
          </FormField>
          <FormField id="expense-note" label={t('create.note')} error={vm(errors.note?.message)}>
            <Input
              id="expense-note"
              autoComplete="off"
              placeholder={t('create.notePlaceholder')}
              aria-invalid={!!errors.note}
              {...register('note')}
            />
          </FormField>
          {create.error ? (
            <p role="alert" className="text-caption text-destructive">
              {te(getErrorCode(create.error))}
            </p>
          ) : null}
          <Button type="submit">{t('create.submit')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
