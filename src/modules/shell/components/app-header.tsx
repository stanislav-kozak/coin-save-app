import { SpaceSwitcher } from '@/modules/spaces';
import { HeaderNav } from './header-nav';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeButton } from './theme-button';
import { UserMenu } from './user-menu';

/** Figma 10:176 (desktop) / 10:177 (mobile). Connection status dot arrives with realtime. */
export function AppHeader({ spaceId }: { spaceId: string }) {
  return (
    <header className="pt-safe box-content flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-16">
      <div className="flex min-w-0 items-center gap-6">
        <SpaceSwitcher currentSpaceId={spaceId} />
        <HeaderNav spaceId={spaceId} />
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-3 md:flex">
          <ThemeButton />
          <LocaleSwitcher />
        </div>
        <UserMenu spaceId={spaceId} />
      </div>
    </header>
  );
}
