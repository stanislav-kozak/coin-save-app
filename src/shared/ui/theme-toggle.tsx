'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

type Props = { lightLabel: string; darkLabel: string };

const noopSubscribe = () => () => {};

export function ThemeToggle({ lightLabel, darkLabel }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known on the client; render nothing during SSR to avoid a hydration mismatch.
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!isClient) return null;

  const isDark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-10 rounded-control border border-border bg-card px-4 text-body font-medium"
    >
      {isDark ? lightLabel : darkLabel}
    </button>
  );
}
