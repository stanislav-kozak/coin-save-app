'use client';

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from 'react';
import { installPrompt } from '../lib/install-prompt';
import { detectPlatform, isStandalone, type Platform } from '../lib/platform';
import { InstallSheet } from './install-sheet';

type PwaInstall = {
  /** Already running as the installed app, or just installed: no install offers then. */
  installed: boolean;
  platform: Platform;
  /** The browser's own install dialog where there is one, else the instructions sheet. */
  install: () => void;
};

const PwaContext = createContext<PwaInstall | null>(null);
const noopSubscribe = () => () => {};

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const prompt = useSyncExternalStore(
    installPrompt.subscribe,
    installPrompt.get,
    installPrompt.get,
  );
  // The platform and display mode exist only in the browser; the server renders no install offers.
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const platform: Platform = isClient ? detectPlatform(navigator) : 'unsupported';
  const installed = !isClient || prompt.installed || isStandalone();

  const install = () => {
    if (prompt.prompt) void installPrompt.prompt();
    else setSheetOpen(true);
  };

  return (
    <PwaContext.Provider value={{ installed, platform, install }}>
      {children}
      {sheetOpen ? <InstallSheet platform={platform} open onOpenChange={setSheetOpen} /> : null}
    </PwaContext.Provider>
  );
}

export function usePwaInstall() {
  const context = useContext(PwaContext);
  if (!context) throw new Error('usePwaInstall must be used inside PwaInstallProvider');
  return context;
}
