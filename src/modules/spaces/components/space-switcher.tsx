'use client';

import { Check, ChevronDown, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/shared/i18n/navigation';
import { Badge } from '@/shared/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { useSpaces } from '../api/spaces-queries';
import { SpaceAvatar } from './space-avatar';

/** Header space switcher (Figma 16:720 / 16:721). */
export function SpaceSwitcher({ currentSpaceId }: { currentSpaceId: string }) {
  const t = useTranslations('spaces');
  const spaces = useSpaces();
  const current = spaces.data?.find((s) => s.id === currentSpaceId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex min-w-0 items-center gap-3 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        {current ? (
          <SpaceAvatar space={current} />
        ) : (
          <span className="size-10 shrink-0 rounded-full bg-border" />
        )}
        <span className="truncate text-h2">{current?.name}</span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        {spaces.data?.map((space) => {
          const isCurrent = space.id === currentSpaceId;
          return (
            <DropdownMenuItem key={space.id} asChild aria-current={isCurrent ? 'true' : undefined}>
              <Link href={`/s/${space.id}`}>
                <SpaceAvatar space={space} size="s" />
                <span className="flex-1 truncate font-medium">{space.name}</span>
                <Badge tone={space.role === 'OWNER' ? 'accent' : 'neutral'}>
                  {t(`roles.${space.role}`)}
                </Badge>
                <Check
                  aria-hidden
                  className={isCurrent ? 'size-4 text-primary' : 'invisible size-4'}
                />
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="font-medium text-primary">
          <Link href="/onboarding">
            <Plus aria-hidden className="size-4" />
            {t('switcher.create')}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
