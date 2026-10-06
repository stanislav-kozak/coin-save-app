import { useTranslations } from 'next-intl';
import { SessionCheck } from '@/modules/auth';

export default function HomePage() {
  const t = useTranslations('home');
  return (
    <main className="p-8">
      <SessionCheck />
      <h1 className="text-h1">{t('title')}</h1>
    </main>
  );
}
