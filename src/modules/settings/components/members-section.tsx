'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCurrentUser } from '@/modules/auth';
import {
  useInvitations,
  useInvite,
  useMembers,
  useRemoveMember,
  useRevokeInvitation,
} from '@/modules/spaces';
import { getErrorCode } from '@/shared/lib/api-error';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { SectionError } from '@/shared/ui/section-error';
import { LoadingRegion, Skeleton } from '@/shared/ui/skeleton';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useMyRole } from '../lib/use-my-role';
import { SettingsSection } from './settings-section';

const inviteSchema = z.object({ email: z.email({ error: 'emailInvalid' }) });
type Invite = z.output<typeof inviteSchema>;
type Role = 'OWNER' | 'MEMBER';

const ICON_BUTTON =
  'flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/50';

function RoleBadge({ role }: { role: Role }) {
  const t = useTranslations('settings.members.roles');
  return (
    <span
      className={cn(
        'rounded-full px-2 text-caption font-medium',
        role === 'OWNER' ? 'bg-primary/12 text-primary' : 'bg-border text-muted-foreground',
      )}
    >
      {t(role)}
    </span>
  );
}

function initialsOf(name: string | null, email: string) {
  const source = name?.trim() || email;
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

/** «Учасники» (Figma 16:722): members, pending invitations, inviting by email. */
export function MembersSection({ spaceId }: { spaceId: string }) {
  const t = useTranslations('settings.members');
  const tc = useTranslations('common');
  const te = useTranslations('errors');
  const locale = useLocale();
  const me = useCurrentUser();
  const members = useMembers(spaceId);
  const invitations = useInvitations(spaceId);
  const remove = useRemoveMember(spaceId);
  const revoke = useRevokeInvitation(spaceId);
  const [removing, setRemoving] = useState<{ id: string; name: string } | null>(null);
  const isOwner = useMyRole(spaceId) === 'OWNER';

  return (
    <SettingsSection id="members" title={t('title')}>
      {members.isError && !members.isFetching ? (
        <SectionError error={members.error} onRetry={() => void members.refetch()} />
      ) : !members.data ? (
        <LoadingRegion label={tc('loading')} className="flex flex-col gap-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </LoadingRegion>
      ) : (
        <ul className="flex flex-col gap-2">
          {members.data.map((m) => {
            const self = m.userId === me.data?.id;
            const label = m.name ?? m.email;
            return (
              <li key={m.membershipId} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-primary-foreground"
                >
                  {initialsOf(m.name, m.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-medium">
                    {label}
                    {self ? <span className="text-muted-foreground"> {t('you')}</span> : null}
                  </p>
                  {m.name ? (
                    <p className="truncate text-caption text-muted-foreground">{m.email}</p>
                  ) : null}
                </div>
                <RoleBadge role={m.role} />
                {isOwner && !self ? (
                  <button
                    type="button"
                    aria-label={t('remove', { name: label })}
                    onClick={() => setRemoving({ id: m.membershipId, name: label })}
                    className={ICON_BUTTON}
                  >
                    <X aria-hidden className="size-4" />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {invitations.data && invitations.data.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-caption font-medium text-muted-foreground">{t('pending')}</h3>
          <ul className="flex flex-col gap-2">
            {invitations.data.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-body">{i.email}</span>
                <span className="text-caption text-muted-foreground">
                  {t('expires', {
                    date: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(
                      new Date(i.expiresAt),
                    ),
                  })}
                </span>
                {isOwner ? (
                  <button
                    type="button"
                    aria-label={t('revoke', { email: i.email })}
                    disabled={revoke.isPending}
                    onClick={() => revoke.mutate(i.id)}
                    className={ICON_BUTTON}
                  >
                    <X aria-hidden className="size-4" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {revoke.error ? (
        <p role="alert" className="text-caption text-destructive">
          {te(getErrorCode(revoke.error))}
        </p>
      ) : null}

      <InviteForm spaceId={spaceId} />

      {removing ? (
        <ConfirmDialog
          title={t('removeTitle')}
          text={t('confirmRemove', { name: removing.name })}
          confirmLabel={t('removeConfirm')}
          tone="danger"
          onConfirm={() => remove.mutateAsync(removing.id)}
          onClose={() => setRemoving(null)}
        />
      ) : null}
    </SettingsSection>
  );
}

/** Any member may invite (backend: SpaceMemberGuard); the API takes only an email. */
function InviteForm({ spaceId }: { spaceId: string }) {
  const t = useTranslations('settings.members');
  const te = useTranslations('errors');
  const invite = useInvite(spaceId);
  const [sent, setSent] = useState<string | null>(null);
  const { register, handleSubmit, formState, reset } = useForm<Invite>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '' },
  });
  const emailError = formState.errors.email;

  const send = async ({ email }: Invite) => {
    setSent(null);
    try {
      await invite.mutateAsync({ email });
      setSent(email);
      reset({ email: '' });
    } catch {
      // shown below via invite.error
    }
  };

  return (
    <form
      noValidate
      onSubmit={(e) => void handleSubmit(send)(e)}
      className="flex flex-col gap-3 md:flex-row md:items-start"
    >
      <div className="flex-1">
        <FormField
          id="invite-email"
          label={t('invite')}
          error={emailError ? t('emailInvalid') : undefined}
        >
          <Input
            id="invite-email"
            type="email"
            autoComplete="off"
            placeholder="email@example.com"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'invite-email-error' : undefined}
            {...register('email')}
          />
        </FormField>
      </div>
      <Button type="submit" disabled={invite.isPending} className="md:mt-6">
        {t('send')}
      </Button>
      {invite.error ? (
        <p role="alert" className="text-caption text-destructive">
          {te(getErrorCode(invite.error))}
        </p>
      ) : null}
      {sent ? (
        <p role="status" className="text-caption text-success">
          {t('sent', { email: sent })}
        </p>
      ) : null}
    </form>
  );
}
