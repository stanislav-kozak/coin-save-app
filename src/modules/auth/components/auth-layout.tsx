import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Logo } from '@/shared/ui/logo';

// Gold coins drifting up the brand panel (desktop only), staggered so it never looks synchronised.
const COINS = [
  { key: 'a', className: 'left-[14%] size-4 [animation-delay:0s]' },
  { key: 'b', className: 'left-[68%] size-3 [animation-delay:2.5s]' },
  { key: 'c', className: 'left-[40%] size-2.5 [animation-delay:5s]' },
  { key: 'd', className: 'left-[82%] size-3.5 [animation-delay:6.5s]' },
];

export function AuthLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('auth.brand');
  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <aside className="relative flex h-30 shrink-0 flex-col items-center justify-center overflow-hidden bg-primary md:h-auto md:w-150">
        {COINS.map((c) => (
          <span
            key={c.key}
            data-coin
            aria-hidden
            className={`absolute -bottom-6 hidden rounded-full bg-palette-amber/60 md:block motion-safe:animate-coin-rise motion-reduce:hidden ${c.className}`}
          />
        ))}
        <Logo motion="intro" tone="on-primary" size="auth" />
        <p className="mt-4 hidden text-body text-primary-foreground/85 md:block">{t('tagline')}</p>
      </aside>
      <main className="flex flex-1 justify-center px-4 py-8 md:items-center md:px-16">
        <div className="w-full max-w-100">{children}</div>
      </main>
    </div>
  );
}
