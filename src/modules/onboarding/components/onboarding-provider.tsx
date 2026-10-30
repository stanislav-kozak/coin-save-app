'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useCurrentUser, useUpdateMe } from '@/modules/auth';
import { OnboardingTour } from './onboarding-tour';

const OnboardingContext = createContext<{ start: () => void } | null>(null);

/**
 * Shows the tour once per account (until `onboardingCompletedAt` is set) and lets the user menu
 * replay it. Finishing, skipping and closing all mark it seen.
 */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const me = useCurrentUser();
  const update = useUpdateMe();
  const [dismissed, setDismissed] = useState(false);
  const [replay, setReplay] = useState(0); // bumped per replay: remounts the tour on its first slide
  const [replaying, setReplaying] = useState(false);
  const firstTime = me.data?.onboardingCompletedAt === null;

  const close = () => {
    setDismissed(true);
    setReplaying(false);
    if (firstTime && !update.isPending) update.mutate({ onboardingCompleted: true });
  };

  const start = () => {
    setReplay((n) => n + 1);
    setReplaying(true);
  };

  return (
    <OnboardingContext.Provider value={{ start }}>
      {children}
      <OnboardingTour key={replay} open={replaying || (firstTime && !dismissed)} onClose={close} />
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return context;
}
