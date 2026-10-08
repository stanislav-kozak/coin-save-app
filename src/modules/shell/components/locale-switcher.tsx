'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useUpdateMe } from '@/modules/auth';
import { usePathname, useRouter } from '@/shared/i18n/navigation';
import { routing, type Locale } from '@/shared/i18n/routing';

const SHORT: Record<Locale, string> = { uk: 'UA', en: 'EN' };

/**
 * Header "UA"/"EN" pill: switches to the other language on the same page right away, and saves it to
 * the account in the background (spec §11); the NEXT_LOCALE cookie remembers it in this browser anyway.
 */
export function LocaleSwitcher() {
  const t = useTranslations('shell.languages');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const next = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;
  const updateMe = useUpdateMe();

  return (
    <button
      type="button"
      aria-label={t(next)}
      onClick={() => {
        updateMe.mutate({ locale: next });
        router.replace(pathname, { locale: next });
      }}
      className="h-8 rounded-full border border-border bg-card px-3 text-caption font-medium"
    >
      {SHORT[locale]}
    </button>
  );
}
