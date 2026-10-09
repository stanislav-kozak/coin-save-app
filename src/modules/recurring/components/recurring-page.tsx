'use client';

import { Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import type { components } from '@/generated/api';
import { useCategories } from '@/modules/categories';
import { useWallets } from '@/modules/wallets';
import { getErrorCode } from '@/shared/lib/api-error';
import { formatMoney } from '@/shared/lib/money';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { EmptyScene } from '@/shared/ui/empty-scene';
import { SectionError } from '@/shared/ui/section-error';
import { LoadingRegion, Skeleton } from '@/shared/ui/skeleton';
import {
  useDeleteRecurring,
  usePauseRecurring,
  useResumeRecurring,
} from '../api/recurring-mutations';
import { useRecurring } from '../api/recurring-queries';
import { monthlyTotals } from '../lib/monthly-totals';
import { RecurringDialog } from './recurring-dialog';
import { RecurringRow } from './recurring-row';

type Rule = components['schemas']['RecurringTransactionResponseDto'];

/** `/recurring` (spec §7.6, Figma 13:437 / 16:471): expenses and incomes with monthly totals. */
export function RecurringPage({ spaceId }: { spaceId: string }) {
  const t = useTranslations('recurring');
  const te = useTranslations('errors');
  const tc = useTranslations('common');
  const locale = useLocale();
  const rules = useRecurring(spaceId);
  // Names and colours for rows, incl. archived ones (a rule may still point at them).
  const wallets = useWallets(spaceId, { includeArchived: true });
  const categories = useCategories(spaceId, { includeArchived: true });
  const pause = usePauseRecurring(spaceId);
  const resume = useResumeRecurring(spaceId);
  const remove = useDeleteRecurring(spaceId);
  const [deleting, setDeleting] = useState<Rule | null>(null);
  // null: closed; 'new': creating; a rule: editing it (the dialog remounts per target).
  const [editing, setEditing] = useState<Rule | 'new' | null>(null);
  const onAdd = () => setEditing('new');
  const toggleError = pause.error ?? resume.error;

  const look = (rule: Rule) => {
    if (rule.type === 'EXPENSE' && rule.categoryId) {
      const c = categories.data?.find((x) => x.id === rule.categoryId);
      if (c) return c;
    }
    const w = wallets.data?.find((x) => x.id === rule.walletId);
    return w ?? { id: rule.id, icon: null, color: null };
  };

  const add = (
    <Button onClick={onAdd} className="hidden md:inline-flex">
      <Plus aria-hidden className="size-4" />
      {t('add')}
    </Button>
  );

  const section = (type: 'EXPENSE' | 'INCOME', list: Rule[]) => {
    const totals = monthlyTotals(list);
    const id = type === 'EXPENSE' ? 'recurring-expenses' : 'recurring-incomes';
    return (
      <section aria-labelledby={id} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
          <h2 id={id} className="text-h2">
            {t(type === 'EXPENSE' ? 'expenses' : 'incomes')}
          </h2>
          {totals.length > 0 ? (
            <p className="text-caption text-muted-foreground">
              {t('total', {
                amount: totals.map((x) => formatMoney(x.amount, x.currency, locale)).join(' + '),
              })}
            </p>
          ) : null}
        </div>
        <ul className="flex flex-col gap-3">
          {list.map((rule) => (
            <RecurringRow
              key={rule.id}
              rule={rule}
              look={look(rule)}
              busy={pause.isPending || resume.isPending}
              onEdit={() => setEditing(rule)}
              onToggle={() => (rule.active ? pause : resume).mutate(rule.id)}
              onDelete={() => setDeleting(rule)}
            />
          ))}
        </ul>
      </section>
    );
  };

  let body;
  if (rules.isError && !rules.isFetching) {
    body = <SectionError error={rules.error} onRetry={() => void rules.refetch()} />;
  } else if (!rules.data) {
    body = (
      <LoadingRegion label={tc('loading')} className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} shape="card" className="h-20" />
        ))}
      </LoadingRegion>
    );
  } else if (rules.data.length === 0) {
    body = (
      <EmptyScene
        scene="repeat"
        title={t('emptyTitle')}
        text={t('emptyText')}
        action={
          <Button onClick={onAdd}>
            <Plus aria-hidden className="size-4" />
            {t('add')}
          </Button>
        }
      />
    );
  } else {
    const expenses = rules.data.filter((r) => r.type === 'EXPENSE');
    const incomes = rules.data.filter((r) => r.type === 'INCOME');
    body = (
      <>
        {toggleError ? (
          <p role="alert" className="text-caption text-destructive">
            {te(getErrorCode(toggleError))}
          </p>
        ) : null}
        {expenses.length > 0 ? section('EXPENSE', expenses) : null}
        {incomes.length > 0 ? section('INCOME', incomes) : null}
      </>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-200 flex-col gap-6 px-4 py-6 md:py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h1">{t('title')}</h1>
        {add}
        <button
          type="button"
          onClick={onAdd}
          aria-label={t('addLabel')}
          className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
        >
          <Plus aria-hidden className="size-5" />
        </button>
      </div>
      {body}
      {editing ? (
        <RecurringDialog
          key={editing === 'new' ? 'new' : editing.id}
          spaceId={spaceId}
          rule={editing === 'new' ? undefined : editing}
          open
          onOpenChange={(open) => !open && setEditing(null)}
          onDelete={() => {
            if (editing === 'new') return;
            setEditing(null);
            setDeleting(editing);
          }}
        />
      ) : null}
      {deleting ? (
        <ConfirmDialog
          title={t('deleteTitle')}
          text={t('confirmDelete', { name: deleting.name })}
          confirmLabel={t('deleteConfirm')}
          tone="danger"
          onConfirm={() => remove.mutateAsync(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      ) : null}
    </main>
  );
}
