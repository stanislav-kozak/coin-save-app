'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  currencyLabel,
  type Currency,
} from '@/shared/constants/currencies';
import { firstUnusedColor } from '@/shared/constants/entity-colors';
import { useRate } from '@/shared/hooks/use-rate';
import { getErrorCode } from '@/shared/lib/api-error';
import { changedFields } from '@/shared/lib/changed-fields';
import { formatMoney, multiplyMoney } from '@/shared/lib/money';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ColorPicker } from '@/shared/ui/color-picker';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import {
  useArchiveCategory,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../api/categories-mutations';
import { useCategories, useMonthAnalytics } from '../api/categories-queries';
import { CATEGORY_EMOJI } from '../lib/category-emoji';
import { categoryFormSchema, type CategoryFormInput, type CategoryFormValues } from '../schemas';
import type { CategoryView } from './category-card';
import { notify } from '@/shared/ui/toaster';

type ValidationKey =
  'nameRequired' | 'nameTooLong' | 'limitInvalid' | 'limitPositive' | 'limitTooLarge';
type Props = {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit this category; without it the dialog creates a new one. */
  category?: CategoryView;
};

/** Create/edit a category: name, emoji, color, monthly limit (spec §4.3, §10.4); archive or delete. */
export function CategoryDialog({ spaceId, open, onOpenChange, category }: Props) {
  const t = useTranslations('categories');
  const tt = useTranslations('toasts');
  const te = useTranslations('errors');
  const locale = useLocale();
  // A limit is in the category's own currency, or the space's primary one (spec §4.3) by default.
  const spaceCurrency = useMonthAnalytics(spaceId).data?.currency as Currency | undefined;
  const categories = useCategories(spaceId);
  const create = useCreateCategory(spaceId);
  const update = useUpdateCategory(spaceId);
  const archive = useArchiveCategory(spaceId);
  const remove = useDeleteCategory(spaceId);
  const [confirm, setConfirm] = useState<'archive' | 'delete' | null>(null);
  const [error, setError] = useState<unknown>(null);
  const busy = create.isPending || update.isPending || archive.isPending || remove.isPending;

  const defaults = (): CategoryFormInput => ({
    name: category?.name ?? '',
    icon: category ? (category.icon ?? '') : CATEGORY_EMOJI[0],
    color: category
      ? (category.color ?? '')
      : firstUnusedColor(categories.data?.map((c) => c.color) ?? []),
    monthlyLimit: category?.monthlyLimit ?? '',
    currency: (category?.currency as Currency | null | undefined) ?? '',
  });
  // State starts fresh per opening: the grid remounts this dialog (`key`) for each target.
  const { register, handleSubmit, formState, control } = useForm<
    CategoryFormInput,
    unknown,
    CategoryFormValues
  >({ resolver: zodResolver(categoryFormSchema), defaultValues: defaults() });

  const errors = formState.errors;
  const chosen = useWatch({ control, name: 'currency' });
  const savedCurrency = (category?.currency as Currency | null | undefined) ?? spaceCurrency;
  const currency = chosen || spaceCurrency;
  // An untouched limit is converted by the server at today's rate, in whole units (min 1).
  const converts =
    !!category?.monthlyLimit &&
    !!savedCurrency &&
    !!currency &&
    currency !== savedCurrency &&
    !formState.dirtyFields.monthlyLimit;
  // Same pair (nothing fetched) unless the limit is about to be converted.
  const from = savedCurrency ?? DEFAULT_CURRENCY;
  const rate = useRate(from, converts && currency ? currency : from);
  const convertedLimit =
    converts && rate.data && category?.monthlyLimit
      ? wholeUnits(multiplyMoney(category.monthlyLimit, rate.data.rate))
      : null;
  // Read during render: react-hook-form only tracks the formState fields a component subscribes to.
  const { dirtyFields } = formState;
  const vm = (key?: string) => (key ? t(`validation.${key as ValidationKey}`) : undefined);
  const icons =
    category?.icon && !(CATEGORY_EMOJI as readonly string[]).includes(category.icon)
      ? [category.icon, ...CATEGORY_EMOJI]
      : CATEGORY_EMOJI;

  // Not optimistic: these are rare, and a refusal (e.g. a taken name) must show in place.
  // `done`: the confirmation toast for a save (none for archive/delete here).
  const run = async (action: () => Promise<unknown>, done?: string) => {
    if (busy) return;
    setError(null);
    try {
      await action();
      if (done) notify(done);
      onOpenChange(false);
    } catch (e) {
      setError(e);
    }
  };

  // Edit sends only what changed (an untouched missing icon/color stays missing); create sends all.
  const save = (values: CategoryFormValues) =>
    run(() => {
      if (category) {
        const { currency: next, ...body } = changedFields(values, dirtyFields);
        return update.mutateAsync({
          id: category.id,
          body: { ...body, ...(dirtyFields.currency ? { currency: next || null } : {}) },
        });
      }
      const { monthlyLimit, currency: own, ...rest } = values;
      return create.mutateAsync({
        ...rest,
        ...(monthlyLimit === null ? {} : { monthlyLimit }),
        ...(own ? { currency: own } : {}),
      });
    }, tt('categorySaved'));

  const alert = error ? (
    <p role="alert" className="text-caption text-destructive">
      {te(getErrorCode(error))}
    </p>
  ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={category ? t('manage.editTitle') : t('manage.createTitle')}
        closeLabel={t('manage.close')}
      >
        {confirm && category ? (
          <div className="flex flex-col gap-4">
            <p className="text-body text-foreground">
              {t(confirm === 'delete' ? 'manage.confirmDelete' : 'manage.confirmArchive', {
                name: category.name,
              })}
            </p>
            {alert}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirm(null);
                  setError(null); // a failed archive/delete must not show under the form
                }}
              >
                {t('manage.cancel')}
              </Button>
              <Button
                variant={confirm === 'delete' ? 'danger' : 'primary'}
                disabled={busy}
                onClick={() =>
                  void run(() =>
                    confirm === 'delete'
                      ? remove.mutateAsync(category.id)
                      : archive.mutateAsync(category.id),
                  )
                }
              >
                {t(confirm === 'delete' ? 'manage.deleteConfirm' : 'manage.archiveConfirm')}
              </Button>
            </div>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(e) => void handleSubmit(save)(e)}
            className="flex flex-col gap-4"
          >
            <FormField id="category-name" label={t('manage.name')} error={vm(errors.name?.message)}>
              <Input
                id="category-name"
                autoComplete="off"
                placeholder={t('manage.namePlaceholder')}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'category-name-error' : undefined}
                {...register('name')}
              />
            </FormField>
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <div
                  role="radiogroup"
                  aria-labelledby="category-icon-label"
                  className="flex flex-col gap-2"
                >
                  <span
                    id="category-icon-label"
                    className="text-caption font-medium text-muted-foreground"
                  >
                    {t('manage.icon')}
                  </span>
                  <div className="grid grid-cols-8 gap-1">
                    {icons.map((emoji) => (
                      <label key={emoji} className="cursor-pointer">
                        <input
                          type="radio"
                          name="category-icon"
                          value={emoji}
                          checked={field.value === emoji}
                          onChange={() => field.onChange(emoji)}
                          aria-label={emoji}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden
                          className={cn(
                            'flex size-9 items-center justify-center rounded-control text-h2 peer-checked:bg-primary/12 peer-checked:ring-2 peer-checked:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                          )}
                        >
                          {emoji}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            />
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <ColorPicker
                  id="category-color"
                  label={t('manage.color')}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <FormField
              id="category-limit"
              label={t('manage.limit')}
              error={vm(errors.monthlyLimit?.message)}
            >
              <div className="flex items-center gap-2">
                <Input
                  id="category-limit"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={t('manage.limitHint')}
                  aria-invalid={!!errors.monthlyLimit}
                  aria-describedby={errors.monthlyLimit ? 'category-limit-error' : undefined}
                  {...register('monthlyLimit')}
                />
                {/* An untouched limit is still in the saved currency until the server converts it. */}
                {(converts ? savedCurrency : currency) ? (
                  <Badge tone="neutral">{converts ? savedCurrency : currency}</Badge>
                ) : null}
              </div>
            </FormField>
            {convertedLimit && currency ? (
              <p className="-mt-2 text-caption text-muted-foreground">
                {t('manage.limitConverted', {
                  amount: formatMoney(convertedLimit, currency, locale),
                })}
              </p>
            ) : null}
            <FormField id="category-currency" label={t('manage.currency')}>
              <select
                id="category-currency"
                className="h-10 w-full rounded-control border border-input bg-card px-3 text-field md:text-body text-foreground outline-none focus-visible:border-primary"
                {...register('currency')}
              >
                <option value="">
                  {t('manage.currencyAsSpace', { currency: spaceCurrency ?? '' })}
                </option>
                {SUPPORTED_CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {currencyLabel(code, locale)}
                  </option>
                ))}
              </select>
            </FormField>
            {alert}
            <Button type="submit" disabled={busy}>
              {t('manage.save')}
            </Button>
            {category ? (
              <div className="flex justify-between gap-2">
                <Button type="button" variant="secondary" onClick={() => setConfirm('archive')}>
                  {t('manage.archive')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setConfirm('delete')}
                >
                  {t('manage.delete')}
                </Button>
              </div>
            ) : null}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Rounded half-up to whole units, at least 1 — as the server converts a limit. */
function wholeUnits(amount: string): string {
  const [int = '0', frac = ''] = amount.replace('-', '').split('.');
  const rounded = BigInt(int) + (frac[0] !== undefined && frac[0] >= '5' ? BigInt(1) : BigInt(0));
  return (rounded < BigInt(1) ? BigInt(1) : rounded).toString();
}
