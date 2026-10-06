const KEY = 'coinsave.pendingEmail';

/** Email waiting for confirmation — kept in this tab's sessionStorage, never in the URL. */
export const pendingEmail = {
  get(): string | null {
    try {
      return sessionStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(email: string): void {
    try {
      sessionStorage.setItem(KEY, email);
    } catch {
      // Private mode / storage disabled: the check-email page falls back to generic copy.
    }
  },
};
