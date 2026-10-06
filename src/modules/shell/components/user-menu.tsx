'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useCurrentUser } from '@/modules/auth';
import { api } from '@/shared/lib/api-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { initials } from '../lib/initials';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeButton } from './theme-button';

export function UserMenu() {
  const t = useTranslations('shell');
  const te = useTranslations('errors');
  const [logoutFailed, setLogoutFailed] = useState(false);
  const locale = useLocale();
  const queryClient = useQueryClient();
  const me = useCurrentUser();

  async function logout() {
    setLogoutFailed(false);
    // Only the server can clear the httpOnly cookies. If it didn't, the proxy would send /login straight
    // back into this account — so stay here and say so rather than pretend.
    const ok = await api.POST('/api/auth/logout').then(
      ({ response }) => response.ok,
      () => false,
    );
    if (!ok) {
      setLogoutFailed(true);
      return;
    }
    queryClient.clear(); // the next person on this browser must not see this user's data
    // Full reload on purpose: drops every in-memory cache, socket and pending request.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/${locale}/login`);
  }

  return (
    <div className="flex items-center gap-3">
      {logoutFailed ? (
        <p role="alert" className="text-caption text-destructive">
          {te('UNKNOWN_ERROR')}
        </p>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t('userMenu')}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-body font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {me.data ? initials(me.data) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {me.data ? <DropdownMenuLabel>{me.data.email}</DropdownMenuLabel> : null}
          {/* Theme and language live in the header on desktop, here on mobile. */}
          <div className="flex items-center gap-2 px-2 py-1.5 md:hidden">
            <ThemeButton />
            <LocaleSwitcher />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void logout()}>{t('logout')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
