import { useTranslations } from 'next-intl';

// Placeholder until this section's task.
export default function Page() {
  const t = useTranslations();
  return (
    <main className="px-4 py-8 md:px-16">
      <h1 className="text-h1">{t('nav.analytics')}</h1>
      <p className="mt-2 text-body text-muted-foreground">{t('dashboard.soon')}</p>
    </main>
  );
}
