import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Logo } from '@/shared/ui/logo';

// Gold coins drifting up the brand panel (desktop only). Delays and durations are inline: the
// animate-* utility is an `animation` shorthand and would reset a delay set by a class.
const COINS = [
  { key: 'a', className: 'left-[14%] size-4', delay: '0s', duration: '8s' },
  { key: 'b', className: 'left-[68%] size-3', delay: '-3s', duration: '9.5s' },
  { key: 'c', className: 'left-[40%] size-2.5', delay: '-5.5s', duration: '7.5s' },
  { key: 'd', className: 'left-[82%] size-3.5', delay: '-1.5s', duration: '10s' },
];

/** `actions`: page-level controls (language, theme) shown top-right of the form column. */
export function AuthLayout({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  const t = useTranslations('auth.brand');
  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <aside className="relative flex h-30 shrink-0 flex-col items-center justify-center overflow-hidden bg-primary md:h-auto md:w-150">
        {COINS.map((c) => (
          <span
            key={c.key}
            data-coin
            aria-hidden
            style={{ animationDelay: c.delay, animationDuration: c.duration }}
            className={`absolute -bottom-6 hidden rounded-full bg-palette-amber/60 md:motion-safe:block motion-safe:animate-coin-rise ${c.className}`}
          />
        ))}
        <Logo motion="intro" tone="on-primary" size="auth" />
        <p className="mt-4 hidden text-body text-primary-foreground/85 md:block">{t('tagline')}</p>
      </aside>
      <main className="relative flex flex-1 justify-center px-4 py-8 md:items-center md:px-16">
        {actions ? (
          <div className="absolute top-3 right-4 flex items-center gap-2 md:top-6 md:right-6">
            {actions}
          </div>
        ) : null}
        <div className={actions ? 'w-full max-w-100 pt-8 md:pt-0' : 'w-full max-w-100'}>
          {children}
        </div>
      </main>
    </div>
  );
}
