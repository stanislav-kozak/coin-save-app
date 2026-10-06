'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

export function ThemeButton() {
  const t = useTranslations('shell');
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known on the client; keep the slot during SSR to avoid layout shift.
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!isClient) return <span className="size-8" />;
  const isDark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      aria-label={`${t('theme')}: ${isDark ? t('themeLight') : t('themeDark')}`}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex size-8 items-center justify-center rounded-full border border-border bg-card"
    >
      {isDark ? <Sun aria-hidden className="size-4" /> : <Moon aria-hidden className="size-4" />}
    </button>
  );
}
