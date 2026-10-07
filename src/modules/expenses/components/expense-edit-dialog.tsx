'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useCategories } from '@/modules/categories';
import { useWallets } from '@/modules/wallets';
import { getErrorCode } from '@/shared/lib/api-error';
import { changedFields } from '@/shared/lib/changed-fields';
import { amountField, noteField } from '@/shared/lib/form-fields';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { LoadingRegion, Skeleton } from '@/shared/ui/skeleton';
import { useDeleteExpense, useUpdateExpense } from '../api/expenses-mutations';

/** The fields both record shapes share (ExpenseResponseDto, AnalyticsExpenseItemDto). */
export type EditableExpense = {
  id: string;
  type: 'EXPENSE' | 'INCOME';
  amount: string;
  walletId: string;
  categoryId: string | null;
  note: string | null;
  occurredAt: string;
};

const pad = (n: number) => String(n).padStart(2, '0');
/** ISO → `datetime-local` value in the user's own time. */
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Messages are keys of `expenses.validation`.
const schema = z.object({
  amount: amountField,
  walletId: z.string().min(1, { error: 'walletRequired' }),
  categoryId: z.string(),
  // The server allows up to 5 minutes ahead (clock skew); anything later is a typo.
  occurredAt: z
    .string()
    .refine((v) => !Number.isNaN(new Date(v).getTime()), { error: 'dateInvalid', abort: true })
    .refine((v) => new Date(v).getTime() <= Date.now() + 60_000, { error: 'dateInFuture' })
    .transform((v) => new Date(v).toISOString()),
  note: noteField,
});
type Values = z.output<typeof schema>;
type Input = z.input<typeof schema>;
type ValidationKey =
  | 'amountRequired'
  | 'amountInvalid'
  | 'amountPositive'
  | 'amountTooLarge'
  | 'noteTooLong'
  | 'walletRequired'
  | 'dateInvalid'
  | 'dateInFuture';

const SELECT =
  'h-10 w-full rounded-control border border-input bg-card px-3 text-field md:text-body text-foreground outline-none focus-visible:border-primary';

/**
 * «Редагувати запис»: amount, wallet, category (expenses), date and time, note; or delete. The type
 * can't change (not in the API). Not optimistic: a balance correction must be exact. Remount per record.
 */
export function ExpenseEditDialog({
  spaceId,
  expense,
  open,
  onOpenChange,
}: {
  spaceId: string;
  expense: EditableExpense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('expenses');
  const te = useTranslations('errors');
  const tc = useTranslations('common');
  const wallets = useWallets(spaceId, { includeArchived: true });
  const categories = useCategories(spaceId, { includeArchived: true });
  const update = useUpdateExpense(spaceId);
  const remove = useDeleteExpense(spaceId);
  const [error, setError] = useState<unknown>(null);
  const [confirm, setConfirm] = useState(false);

  const { register, handleSubmit, formState, control } = useForm<Input, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: expense.amount,
      walletId: expense.walletId,
      categoryId: expense.categoryId ?? '',
      occurredAt: toLocalInput(expense.occurredAt),
      note: expense.note ?? '',
    },
  });
  const errors = formState.errors;
  // Read during render: react-hook-form only tracks the formState fields a component subscribes to.
  const { dirtyFields } = formState;
  const vm = (key?: string) => (key ? t(`validation.${key as ValidationKey}`) : undefined);
  const walletId = useWatch({ control, name: 'walletId' });
  const wallet = wallets.data?.find((w) => w.id === walletId);

  const save = async (values: Values) => {
    setError(null);
    const { categoryId, note, ...rest } = changedFields(values, dirtyFields);
    // null clears (uncategorized / no note); a cleared note parses to undefined, which JSON drops.
    const body = {
      ...rest,
      ...(dirtyFields.categoryId ? { categoryId: categoryId || null } : {}),
      ...(dirtyFields.note ? { note: note || null } : {}),
    };
    try {
      await update.mutateAsync({ id: expense.id, body });
      onOpenChange(false);
    } catch (e) {
      setError(e);
    }
  };

  if (confirm) {
    return (
      <ConfirmDialog
        title={t('edit.deleteTitle')}
        text={t('edit.confirmDelete')}
        confirmLabel={t('edit.delete')}
        tone="danger"
        onConfirm={async () => {
          await remove.mutateAsync(expense.id);
          onOpenChange(false);
        }}
        onClose={() => setConfirm(false)}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t('edit.title')} closeLabel={tc('close')}>
        {/* Selects take their value when mounted: wait for the lists so they show the record's own. */}
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
            <FormField
              id="edit-amount"
              label={t('create.amount')}
              error={vm(errors.amount?.message)}
            >
              <div className="flex items-center gap-2">
                <Input
                  id="edit-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? 'edit-amount-error' : undefined}
                  {...register('amount')}
                />
                {wallet ? <Badge tone="neutral">{wallet.currency}</Badge> : null}
              </div>
            </FormField>
            <FormField id="edit-wallet" label={t('create.wallet')}>
              <select id="edit-wallet" className={SELECT} {...register('walletId')}>
                {wallets.data
                  .filter((w) => !w.archived || w.id === expense.walletId)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} · {w.currency}
                      {w.archived ? ` ${t('edit.archived')}` : ''}
                    </option>
                  ))}
              </select>
            </FormField>
            {expense.type === 'EXPENSE' ? (
              <FormField id="edit-category" label={t('create.category')}>
                <select id="edit-category" className={SELECT} {...register('categoryId')}>
                  <option value="">{t('create.noCategory')}</option>
                  {categories.data
                    .filter((c) => !c.archived || c.id === expense.categoryId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                        {c.archived ? ` ${t('edit.archived')}` : ''}
                      </option>
                    ))}
                </select>
              </FormField>
            ) : null}
            <FormField id="edit-when" label={t('edit.when')} error={vm(errors.occurredAt?.message)}>
              <Input
                id="edit-when"
                type="datetime-local"
                aria-invalid={!!errors.occurredAt}
                aria-describedby={errors.occurredAt ? 'edit-when-error' : undefined}
                {...register('occurredAt')}
              />
            </FormField>
            <FormField id="edit-note" label={t('create.note')} error={vm(errors.note?.message)}>
              <Input id="edit-note" autoComplete="off" {...register('note')} />
            </FormField>
            {error ? (
              <p role="alert" className="text-caption text-destructive">
                {te(getErrorCode(error))}
              </p>
            ) : null}
            <Button type="submit" disabled={update.isPending}>
              {t('edit.save')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={() => setConfirm(true)}
            >
              {t('edit.delete')}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
