'use client';

import { useTranslations } from 'next-intl';
import { ArchivedCategoriesSection, WalletsSection } from './archived-section';
import { DangerSection } from './danger-section';
import { MembersSection } from './members-section';
import { PreferencesSection } from './preferences-section';
import { SpaceSection } from './space-section';

/** Settings (Figma 16:722 / 16:723): one column of section cards. */
export function SettingsPage({ spaceId }: { spaceId: string }) {
  const t = useTranslations('settings');
  return (
    <main className="mx-auto flex w-full max-w-180 flex-col gap-6 px-4 py-6 md:py-10">
      <h1 className="text-h1">{t('title')}</h1>
      <SpaceSection spaceId={spaceId} />
      <MembersSection spaceId={spaceId} />
      <WalletsSection spaceId={spaceId} />
      <ArchivedCategoriesSection spaceId={spaceId} />
      <PreferencesSection />
      <DangerSection spaceId={spaceId} />
    </main>
  );
}
