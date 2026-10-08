'use client';

import { useTranslations } from 'next-intl';
import { AccountSection } from './account-section';
import { PreferencesSection } from './preferences-section';
import { SecuritySection } from './security-section';

/** The user's own settings (no Figma frame yet; the same cards as the space settings). */
export function ProfilePage() {
  const t = useTranslations('profile');
  return (
    <main className="mx-auto flex w-full max-w-180 flex-col gap-6 px-4 py-6 md:py-10">
      <h1 className="text-h1">{t('title')}</h1>
      <AccountSection />
      <PreferencesSection />
      <SecuritySection />
    </main>
  );
}
