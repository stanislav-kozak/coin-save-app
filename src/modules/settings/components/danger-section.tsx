'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDeleteSpace, useLeaveSpace, useSpace } from '@/modules/spaces';
import { useRouter } from '@/shared/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { ConfirmDialog } from './confirm-dialog';
import { useMyRole } from '../lib/use-my-role';
import { SettingsSection } from './settings-section';

/**
 * «Небезпечна зона»: the owner deletes the space (typing its name to confirm), a member leaves it.
 * Afterwards `/` picks another space or onboarding — never this one's 403.
 */
export function DangerSection({ spaceId }: { spaceId: string }) {
  const t = useTranslations('settings.danger');
  const router = useRouter();
  const space = useSpace(spaceId);
  const role = useMyRole(spaceId);
  const remove = useDeleteSpace(spaceId);
  const leave = useLeaveSpace(spaceId);
  const [confirm, setConfirm] = useState<'delete' | 'leave' | null>(null);
  const [typed, setTyped] = useState('');
  if (!space.data || !role) return null;
  const { name } = space.data;
  const isOwner = role === 'OWNER';

  const close = () => {
    setConfirm(null);
    setTyped('');
  };

  return (
    <SettingsSection id="danger" title={t('title')} tone="danger">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          className="border-destructive text-destructive hover:bg-destructive/10"
          onClick={() => setConfirm(isOwner ? 'delete' : 'leave')}
        >
          {isOwner ? t('delete') : t('leave')}
        </Button>
        <p className="text-caption text-muted-foreground">
          {isOwner ? t('deleteHint') : t('leaveHint')}
        </p>
      </div>
      {confirm === 'delete' ? (
        <ConfirmDialog
          title={t('delete')}
          text={t('confirmDelete', { name })}
          confirmLabel={t('deleteConfirm')}
          tone="danger"
          canConfirm={typed.trim() === name}
          onConfirm={async () => {
            await remove.mutateAsync();
            router.replace('/');
          }}
          onClose={close}
        >
          <FormField id="delete-space-name" label={t('typeName')}>
            <Input
              id="delete-space-name"
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
          </FormField>
        </ConfirmDialog>
      ) : null}
      {confirm === 'leave' ? (
        <ConfirmDialog
          title={t('leave')}
          text={t('confirmLeave', { name })}
          confirmLabel={t('leaveConfirm')}
          tone="danger"
          onConfirm={async () => {
            await leave.mutateAsync();
            router.replace('/');
          }}
          onClose={close}
        />
      ) : null}
    </SettingsSection>
  );
}
