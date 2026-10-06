'use client';

import { ChartPie, Home, Repeat, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NewExpenseButton } from '@/modules/expenses';
import { Link, usePathname } from '@/shared/i18n/navigation';
import { cn } from '@/shared/lib/utils';

/** Mobile bottom navigation (Figma 10:177) with the "+" new-expense button in the middle. */
export function BottomNav({ spaceId }: { spaceId: string }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const base = `/s/${spaceId}`;
  const items = [
    { href: base, label: t('home'), Icon: Home },
    { href: `${base}/recurring`, label: t('recurring'), Icon: Repeat },
    null, // the "+" button
    { href: `${base}/analytics`, label: t('analytics'), Icon: ChartPie },
    { href: `${base}/settings`, label: t('settings'), Icon: Settings },
  ];
  return (
    <nav
      aria-label={t('label')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden"
    >
      <ul className="grid grid-cols-5 items-end">
        {items.map((item) => {
          if (!item) {
            return (
              <li key="new-expense" className="flex justify-center pb-2">
                <NewExpenseButton />
              </li>
            );
          }
          const { href, label, Icon } = item;
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 px-1 py-2 text-caption',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon aria-hidden className="size-5" />
                {/* Long labels ("Налаштування") must not spill on narrow phones */}
                <span className="max-w-full truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
