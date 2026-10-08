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
/** `saveToAccount={false}` on signed-out pages: there is no account to save to (only the address/cookie). */
export function LocaleSwitcher({ saveToAccount = true }: { saveToAccount?: boolean } = {}) {
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
        if (saveToAccount) updateMe.mutate({ locale: next });
        // Keep the query: email links (reset password, verify email) carry their token in it.
        router.replace(`${pathname}${window.location.search}`, { locale: next });
      }}
      className="h-8 rounded-full border border-border bg-card px-3 text-caption font-medium"
    >
      {SHORT[locale]}
    </button>
  );
}
