import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { HealthStatus } from './health-status';

const SWATCHES = [
  'bg-primary',
  'bg-primary-hover',
  'bg-success',
  'bg-warning',
  'bg-destructive',
  'bg-background',
  'bg-card',
  'bg-border',
  'bg-foreground',
  'bg-muted-foreground',
] as const;

export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const t = useTranslations();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-display">{t('styleguide.title')}</h1>
        <ThemeToggle lightLabel={t('common.themeLight')} darkLabel={t('common.themeDark')} />
      </div>

      <section className="rounded-card bg-card p-6 shadow-card">
        <h2 className="mb-2 text-h2">{t('styleguide.health')}</h2>
        <HealthStatus />
      </section>

      <section className="rounded-card bg-card p-6 shadow-card">
        <h2 className="mb-4 text-h2">{t('styleguide.colors')}</h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {SWATCHES.map((cls) => (
            <li key={cls} className="flex flex-col gap-2">
              <span className={`${cls} h-16 rounded-control border border-border`} />
              <code className="text-caption text-muted-foreground">{cls}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-card bg-card p-6 shadow-card">
        <h2 className="mb-4 text-h2">{t('styleguide.typography')}</h2>
        <div className="flex flex-col gap-3">
          <p className="text-display">Display 32/40 · Гаманці</p>
          <p className="text-h1">H1 24/32 · Сімейний бюджет</p>
          <p className="text-h2">H2 18/26 · Продукти</p>
          <p className="text-body">Body 15/22 · Кава з колегами</p>
          <p className="text-body font-medium">Body Medium 15/22 · Моно</p>
          <p className="text-caption text-muted-foreground">Caption 13/18 · сьогодні, 14:05</p>
          <p className="text-money">₴ 12 345.50</p>
          <p className="text-money text-destructive">−₴ 1 200.00</p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-h2">{t('styleguide.surfaces')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-card bg-card p-4 shadow-card">shadow-card</div>
          <div className="rotate-2 rounded-card bg-card p-4 shadow-card-raised">
            shadow-card-raised
          </div>
          <div className="rounded-card bg-card p-4 shadow-modal">shadow-modal</div>
        </div>
      </section>
    </main>
  );
}
