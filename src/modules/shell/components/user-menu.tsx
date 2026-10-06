'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
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
  const locale = useLocale();
  const queryClient = useQueryClient();
  const me = useCurrentUser();

  async function logout() {
    try {
      await api.POST('/api/auth/logout');
    } catch {
      // Leave anyway; the server session expires on its own.
    }
    queryClient.clear(); // the next person on this browser must not see this user's data
    // Full reload on purpose: drops every in-memory cache, socket and pending request.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/${locale}/login`);
  }

  return (
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
  );
}
