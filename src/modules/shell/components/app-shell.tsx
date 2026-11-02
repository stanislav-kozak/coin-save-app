import type { ReactNode } from 'react';
import { ExpenseLauncherProvider } from '@/modules/expenses';
import { OnboardingProvider } from '@/modules/onboarding';
import { PwaInstallProvider } from '@/modules/pwa';
import { ConnectionBanner, RealtimeProvider } from '@/modules/realtime';
import { SpaceGuard } from '@/modules/spaces';
import { AppHeader } from './app-header';
import { AnimatedBackground } from '@/shared/ui/animated-background';
import { Toaster } from '@/shared/ui/toaster';
import { BottomNav } from './bottom-nav';

export function AppShell({ spaceId, children }: { spaceId: string; children: ReactNode }) {
  return (
    <RealtimeProvider spaceId={spaceId}>
      <ExpenseLauncherProvider spaceId={spaceId}>
        <PwaInstallProvider>
          <OnboardingProvider>
            {/* No bg here: the body paints the background color, the animated grid sits on it. */}
            <div className="pb-nav flex min-h-dvh flex-col md:pb-0">
              <AnimatedBackground />
              {/* Header and connection banner stick together at the top. */}
              <div className="sticky top-0 z-40">
                <AppHeader spaceId={spaceId} />
                <ConnectionBanner />
              </div>
              <SpaceGuard spaceId={spaceId}>{children}</SpaceGuard>
              <BottomNav spaceId={spaceId} />
              <Toaster />
            </div>
          </OnboardingProvider>
        </PwaInstallProvider>
      </ExpenseLauncherProvider>
    </RealtimeProvider>
  );
}
