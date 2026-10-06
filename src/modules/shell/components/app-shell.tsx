import type { ReactNode } from 'react';
import { SpaceGuard } from '@/modules/spaces';
import { AppHeader } from './app-header';

export function AppShell({ spaceId, children }: { spaceId: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader spaceId={spaceId} />
      <SpaceGuard spaceId={spaceId}>{children}</SpaceGuard>
    </div>
  );
}
