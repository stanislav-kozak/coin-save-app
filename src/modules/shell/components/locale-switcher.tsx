'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/shared/i18n/navigation';
import { routing, type Locale } from '@/shared/i18n/routing';

const SHORT: Record<Locale, string> = { uk: 'UA', en: 'EN' };

/**
 * Header "UA"/"EN" pill: switches to the other language on the same page. Remembered per browser by
 * next-intl's NEXT_LOCALE cookie only — the backend has no endpoint to save it to the profile yet.
 */
export function LocaleSwitcher() {
  const t = useTranslations('shell.languages');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const next = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;

  return (
    <button
      type="button"
      aria-label={t(next)}
      onClick={() => router.replace(pathname, { locale: next })}
      className="h-8 rounded-full border border-border bg-card px-3 text-caption font-medium"
    >
      {SHORT[locale]}
    </button>
  );
}
