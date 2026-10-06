import { useTranslations } from 'next-intl';

export function OrDivider() {
  const t = useTranslations('auth');
  return (
    <div className="my-4 flex items-center gap-3 text-caption text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {t('divider')}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
