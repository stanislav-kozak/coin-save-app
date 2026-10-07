import type { ReactNode } from 'react';
import { ExpenseLauncherProvider } from '@/modules/expenses';
import { RealtimeProvider } from '@/modules/realtime';
import { SpaceGuard } from '@/modules/spaces';
import { AppHeader } from './app-header';
import { BottomNav } from './bottom-nav';

export function AppShell({ spaceId, children }: { spaceId: string; children: ReactNode }) {
  return (
    <RealtimeProvider spaceId={spaceId}>
      <ExpenseLauncherProvider spaceId={spaceId}>
        <div className="pb-nav flex min-h-dvh flex-col bg-background md:pb-0">
          <AppHeader spaceId={spaceId} />
          <SpaceGuard spaceId={spaceId}>{children}</SpaceGuard>
          <BottomNav spaceId={spaceId} />
        </div>
      </ExpenseLauncherProvider>
    </RealtimeProvider>
  );
}
