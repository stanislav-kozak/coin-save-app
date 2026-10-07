const KEY = 'coinsave.pendingInvitation';

/**
 * An invitation token opened while signed out, kept across login/signup (incl. the email-verification
 * tab) so the landing page can finish joining. localStorage, guarded like `lastSpace`.
 */
export const pendingInvitation = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(KEY, token);
    } catch {
      // storage blocked: the user can open the email link again after signing in
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // nothing stored
    }
  },
};
