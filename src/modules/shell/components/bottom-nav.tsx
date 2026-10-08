'use client';

import { ChartPie, Home, Repeat, Settings, type LucideIcon } from 'lucide-react';
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
    { href: `${base}/settings`, label: t('spaceSettings'), Icon: Settings },
  ];
  return (
    <nav
      aria-label={t('label')}
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          if (!item) {
            return (
              <li key="new-expense" className="flex items-end justify-center pb-2">
                <NewExpenseButton />
              </li>
            );
          }
          return (
            <li key={item.href}>
              <NavItem {...item} active={pathname === item.href} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type ItemProps = { href: string; label: string; Icon: LucideIcon; active: boolean };

/** Icon only; the name is the link's accessible name and its tooltip. */
function NavItem({ href, label, Icon, active }: ItemProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-full items-center justify-center px-1 py-4',
        active ? 'text-primary' : 'text-muted-foreground',
      )}
    >
      <Icon aria-hidden className="size-6" />
    </Link>
  );
}
