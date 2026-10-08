'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/shared/i18n/navigation';
import { cn } from '@/shared/lib/utils';

/**
 * Desktop section tabs in the header (mobile has the bottom nav). Not in Figma 10:176 yet; settings
 * stay in the user menu.
 */
export function HeaderNav({ spaceId }: { spaceId: string }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const base = `/s/${spaceId}`;
  const items = [
    { href: base, label: t('home') },
    { href: `${base}/recurring`, label: t('recurring') },
    { href: `${base}/analytics`, label: t('analytics') },
  ];
  return (
    <nav aria-label={t('label')} className="hidden md:ml-3 md:flex">
      <ul className="flex items-center gap-1">
        {items.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-control px-3 py-2 text-body font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
