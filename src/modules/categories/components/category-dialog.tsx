'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { firstUnusedColor } from '@/shared/constants/entity-colors';
import { getErrorCode } from '@/shared/lib/api-error';
import { changedFields } from '@/shared/lib/changed-fields';
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
  const te = useTranslations('errors');
  // Limits are in the space's primary currency (spec §4.3) — the same one analytics reports in.
  const currency = useMonthAnalytics(spaceId).data?.currency;
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
  });
  // State starts fresh per opening: the grid remounts this dialog (`key`) for each target.
  const { register, handleSubmit, formState, control } = useForm<
    CategoryFormInput,
    unknown,
    CategoryFormValues
  >({ resolver: zodResolver(categoryFormSchema), defaultValues: defaults() });

  const errors = formState.errors;
  // Read during render: react-hook-form only tracks the formState fields a component subscribes to.
  const { dirtyFields } = formState;
  const vm = (key?: string) => (key ? t(`validation.${key as ValidationKey}`) : undefined);
  const icons =
    category?.icon && !(CATEGORY_EMOJI as readonly string[]).includes(category.icon)
      ? [category.icon, ...CATEGORY_EMOJI]
      : CATEGORY_EMOJI;

  // Not optimistic: these are rare, and a refusal (e.g. a taken name) must show in place.
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

  // Edit sends only what changed (an untouched missing icon/color stays missing); create sends all.
  const save = (values: CategoryFormValues) =>
    run(() => {
      if (category) {
        return update.mutateAsync({
          id: category.id,
          body: changedFields(values, dirtyFields),
        });
      }
      const { monthlyLimit, ...rest } = values;
      return create.mutateAsync({ ...rest, ...(monthlyLimit === null ? {} : { monthlyLimit }) });
    });

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
              <Button variant="secondary" onClick={() => setConfirm(null)}>
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
                {currency ? <Badge tone="neutral">{currency}</Badge> : null}
              </div>
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
