import type { ReactNode } from 'react';
import { ExpenseLauncherProvider } from '@/modules/expenses';
import { SpaceGuard } from '@/modules/spaces';
import { AppHeader } from './app-header';
import { BottomNav } from './bottom-nav';

export function AppShell({ spaceId, children }: { spaceId: string; children: ReactNode }) {
  return (
    <ExpenseLauncherProvider spaceId={spaceId}>
      <div className="flex min-h-dvh flex-col bg-background">
        <AppHeader spaceId={spaceId} />
        <SpaceGuard spaceId={spaceId}>{children}</SpaceGuard>
        <BottomNav spaceId={spaceId} />
      </div>
    </ExpenseLauncherProvider>
  );
}
