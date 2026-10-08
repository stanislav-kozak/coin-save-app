'use client';

import { useTranslations } from 'next-intl';
import { ArchivedCategoriesSection, WalletsSection } from './archived-section';
import { DangerSection } from './danger-section';
import { MembersSection } from './members-section';
import { SpaceSection } from './space-section';

/** Space settings (Figma 16:722 / 16:723): one column of section cards. The user's own are on Profile. */
export function SettingsPage({ spaceId }: { spaceId: string }) {
  const t = useTranslations('settings');
  return (
    <main className="mx-auto flex w-full max-w-180 flex-col gap-6 px-4 py-6 md:py-10">
      <h1 className="text-h1">{t('spaceTitle')}</h1>
      <SpaceSection spaceId={spaceId} />
      <MembersSection spaceId={spaceId} />
      <WalletsSection spaceId={spaceId} />
      <ArchivedCategoriesSection spaceId={spaceId} />
      <DangerSection spaceId={spaceId} />
    </main>
  );
}
