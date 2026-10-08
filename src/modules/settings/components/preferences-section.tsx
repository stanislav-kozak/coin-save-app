'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { useUpdateMe } from '@/modules/auth';
import { usePathname, useRouter } from '@/shared/i18n/navigation';
import { getErrorCode } from '@/shared/lib/api-error';
import type { Locale } from '@/shared/i18n/routing';
import { PillGroup } from './pill-group';
import { SettingsSection } from './settings-section';

const noopSubscribe = () => () => {};

/**
 * «Мова та тема»: the same switches as the header, as explicit choices. The language is saved to the
 * account first and switched after: switching remounts the page, which would lose an error message.
 */
export function PreferencesSection() {
  const t = useTranslations('settings.preferences');
  const te = useTranslations('errors');
  const updateMe = useUpdateMe();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known on the client: no pre-selected pill during SSR.
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  return (
    <SettingsSection id="preferences" title={t('title')}>
      <PillGroup
        label={t('language')}
        options={[
          { value: 'uk', label: 'UA' },
          { value: 'en', label: 'EN' },
        ]}
        value={locale}
        onChange={(next) => {
          if (updateMe.isPending) return;
          updateMe.mutate(
            { locale: next as Locale },
            { onSuccess: () => router.replace(pathname, { locale: next as Locale }) },
          );
        }}
      />
      {updateMe.isError ? (
        <p role="alert" className="text-caption text-destructive">
          {te(getErrorCode(updateMe.error))}
        </p>
      ) : null}
      <PillGroup
        label={t('theme')}
        options={[
          { value: 'light', label: t('light') },
          { value: 'dark', label: t('dark') },
        ]}
        value={isClient ? resolvedTheme : undefined}
        onChange={setTheme}
      />
    </SettingsSection>
  );
}
