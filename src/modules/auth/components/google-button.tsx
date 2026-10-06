import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';

/** Full navigation: the backend redirects to Google and back to `/` with cookies set. */
export function GoogleButton() {
  const t = useTranslations('auth');
  return (
    <Button variant="secondary" className="w-full" asChild>
      {/* Backend route, not a page: needs a full navigation, never a client-side <Link>. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/api/auth/google">{t('google')}</a>
    </Button>
  );
}
