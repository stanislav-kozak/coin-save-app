/** Chromium's install prompt (not in the TS DOM lib). */
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type State = { prompt: BeforeInstallPromptEvent | null; installed: boolean };

let state: State = { prompt: null, installed: false };
const listeners = new Set<() => void>();
const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

/**
 * `beforeinstallprompt` fires once per page load, possibly before React mounts, so it is captured
 * when this module loads (the app shell's bundle). Its default mini-infobar is held back: the
 * user menu and the mobile banner offer the install instead.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    set({ prompt: e as BeforeInstallPromptEvent });
  });
  window.addEventListener('appinstalled', () => set({ prompt: null, installed: true }));
}

export const installPrompt = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => state,
  /** Shows the browser's own install dialog; the event can be used only once. */
  async prompt(): Promise<'accepted' | 'dismissed'> {
    const event = state.prompt;
    if (!event) return 'dismissed';
    set({ prompt: null });
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === 'accepted') set({ installed: true });
    return outcome;
  },
};
