'use client';

import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { useCategories, useUnarchiveCategory } from '@/modules/categories';
import {
  useUnarchiveWallet,
  useWallets,
  WalletDialog,
  type EditableWallet,
} from '@/modules/wallets';
import { Button } from '@/shared/ui/button';
import { EntityIcon } from '@/shared/ui/entity-icon';
import { getErrorCode } from '@/shared/lib/api-error';
import { SectionError } from '@/shared/ui/section-error';
import { LoadingRegion, Skeleton } from '@/shared/ui/skeleton';
import { SettingsSection } from './settings-section';

type Item = { id: string; name: string; icon: string | null; color: string | null };

function Row({ item, muted, children }: { item: Item; muted?: boolean; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <EntityIcon id={item.id} color={item.color} icon={item.icon} size="s" />
      <span className={muted ? 'flex-1 truncate text-muted-foreground' : 'flex-1 truncate'}>
        {item.name}
      </span>
      {children}
    </li>
  );
}

function MutationError({ error }: { error: unknown }) {
  const te = useTranslations('errors');
  return error ? (
    <p role="alert" className="text-caption text-destructive">
      {te(getErrorCode(error))}
    </p>
  ) : null;
}

function Loading() {
  const t = useTranslations('common');
  return (
    <LoadingRegion label={t('loading')} className="flex flex-col gap-3">
      <Skeleton className="h-8" />
      <Skeleton className="h-8" />
    </LoadingRegion>
  );
}

/**
 * «Гаманці»: edit any wallet (the phone-width entry point — the dashboard circles are drag/tap
 * targets) and restore archived ones.
 */
export function WalletsSection({ spaceId }: { spaceId: string }) {
  const t = useTranslations('settings.wallets');
  const tw = useTranslations('wallets.edit');
  const wallets = useWallets(spaceId, { includeArchived: true });
  const restore = useUnarchiveWallet(spaceId);
  const [editing, setEditing] = useState<EditableWallet | null>(null);
  const active = wallets.data?.filter((w) => !w.archived) ?? [];
  const archived = wallets.data?.filter((w) => w.archived) ?? [];

  return (
    <SettingsSection id="wallets" title={t('title')}>
      {wallets.isError && !wallets.isFetching ? (
        <SectionError error={wallets.error} onRetry={() => void wallets.refetch()} />
      ) : !wallets.data ? (
        <Loading />
      ) : (
        <>
          {active.length === 0 ? (
            <p className="text-body text-muted-foreground">{t('none')}</p>
          ) : (
            <ul>
              {active.map((w) => (
                <Row key={w.id} item={w}>
                  <span className="text-caption text-muted-foreground">{w.currency}</span>
                  <button
                    type="button"
                    aria-label={tw('edit', { name: w.name })}
                    onClick={() => setEditing(w)}
                    className="flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-primary/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <Pencil aria-hidden className="size-4" />
                  </button>
                </Row>
              ))}
            </ul>
          )}
          {archived.length > 0 ? (
            <div className="flex flex-col gap-1">
              <h3 className="text-caption font-medium text-muted-foreground">{t('archived')}</h3>
              <ul>
                {archived.map((w) => (
                  <Row key={w.id} item={w} muted>
                    <Button
                      variant="ghost"
                      size="s"
                      aria-label={tw('restoreItem', { name: w.name })}
                      disabled={restore.isPending}
                      onClick={() => restore.mutate(w.id)}
                    >
                      {tw('restore')}
                    </Button>
                  </Row>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
      <MutationError error={restore.error} />
      {editing ? (
        <WalletDialog
          key={editing.id}
          spaceId={spaceId}
          wallet={editing}
          open
          onOpenChange={(open) => !open && setEditing(null)}
        />
      ) : null}
    </SettingsSection>
  );
}

/** «Архівовані категорії»: archive is reversible from here (history keeps their names). */
export function ArchivedCategoriesSection({ spaceId }: { spaceId: string }) {
  const t = useTranslations('settings.categories');
  const tw = useTranslations('wallets.edit');
  const categories = useCategories(spaceId, { includeArchived: true });
  const restore = useUnarchiveCategory(spaceId);
  const archived = categories.data?.filter((c) => c.archived) ?? [];

  return (
    <SettingsSection id="archived-categories" title={t('title')}>
      {categories.isError && !categories.isFetching ? (
        <SectionError error={categories.error} onRetry={() => void categories.refetch()} />
      ) : !categories.data ? (
        <Loading />
      ) : archived.length === 0 ? (
        <p className="text-body text-muted-foreground">{t('none')}</p>
      ) : (
        <ul>
          {archived.map((c) => (
            <Row key={c.id} item={c} muted>
              <Button
                variant="ghost"
                size="s"
                aria-label={tw('restoreItem', { name: c.name })}
                disabled={restore.isPending}
                onClick={() => restore.mutate(c.id)}
              >
                {tw('restore')}
              </Button>
            </Row>
          ))}
        </ul>
      )}
      <MutationError error={restore.error} />
    </SettingsSection>
  );
}
