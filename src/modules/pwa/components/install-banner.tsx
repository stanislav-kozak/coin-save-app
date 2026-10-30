'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useSyncExternalStore } from 'react';
import { BrandMark } from '@/shared/ui/brand-mark';
import { Button } from '@/shared/ui/button';
import { usePwaInstall } from './pwa-install-provider';

const DISMISSED_KEY = 'coinsave:install-banner-dismissed';
const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
};
const noopSubscribe = () => () => {};

/**
 * Phones only: a dismissible card on the dashboard offering to install the app. Once closed it
 * stays closed on this device; it never shows inside the installed app.
 */
export function InstallBanner() {
  const t = useTranslations('pwa.banner');
  const tc = useTranslations('common');
  const { installed, platform, install } = usePwaInstall();
  // Hidden on the server and until the browser says otherwise (no flash for dismissed users).
  const stored = useSyncExternalStore(noopSubscribe, readDismissed, () => true);
  const [closed, setClosed] = useState(false);

  if (installed || stored || closed || (platform !== 'ios' && platform !== 'android')) return null;

  const dismiss = () => {
    setClosed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // private mode: it just comes back next time
    }
  };

  return (
    <section
      aria-label={t('title')}
      className="relative flex gap-3 rounded-card border border-border bg-card p-4 pr-10 shadow-card md:hidden"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-control bg-primary">
        <BrandMark size={28} tone="on-primary" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <div>
          <p className="text-body font-medium">{t('title')}</p>
          <p className="text-caption text-muted-foreground">{t('text')}</p>
        </div>
        <Button size="s" onClick={install}>
          {t('install')}
        </Button>
      </div>
      <button
        type="button"
        aria-label={tc('close')}
        onClick={dismiss}
        className="absolute top-3 right-3 rounded-control p-1 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <X aria-hidden className="size-4" />
      </button>
    </section>
  );
}
