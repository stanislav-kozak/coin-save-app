import { useTranslations } from 'next-intl';

// Placeholder until the main screen task.
export default function SpaceHomePage() {
  const t = useTranslations('spaces.home');
  return (
    <main className="px-4 py-8 md:px-16">
      <h1 className="text-h1">{t('title')}</h1>
    </main>
  );
}
