import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

// Brand panel decor (Figma 10:336–10:340): palette colors at 35%, positions on a 600×900 panel.
const DECOR = [
  'left-15 top-20 size-12 bg-palette-blue/35',
  'left-120 top-35 size-16 bg-palette-teal/35',
  'left-105 top-170 size-10 bg-palette-amber/35',
  'left-22 top-185 size-14 bg-palette-violet/35',
  'left-130 top-105 size-6 bg-palette-emerald/35',
];

export function AuthLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('auth.brand');
  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <aside className="relative flex h-30 shrink-0 flex-col items-center justify-center overflow-hidden bg-primary md:h-auto md:w-150">
        {DECOR.map((cls) => (
          <span key={cls} aria-hidden className={`absolute hidden rounded-full md:block ${cls}`} />
        ))}
        <p className="text-h1 text-primary-foreground md:text-display">CoinSave</p>
        <p className="mt-3 hidden text-body text-primary-foreground/85 md:block">{t('tagline')}</p>
      </aside>
      <main className="flex flex-1 justify-center px-4 py-8 md:items-center md:px-16">
        <div className="w-full max-w-100">{children}</div>
      </main>
    </div>
  );
}
