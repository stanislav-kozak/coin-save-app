const KEY = 'coinsave.lastSpaceId';

/** Convenience only — picks where to land; the URL is the source of truth for the current space. */
export const lastSpace = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  /** Forget `id` if it is the remembered space (e.g. the user lost access to it). */
  forget(id: string): void {
    try {
      if (localStorage.getItem(KEY) === id) localStorage.removeItem(KEY);
    } catch {
      // storage blocked: nothing remembered anyway
    }
  },
  set(id: string): void {
    try {
      localStorage.setItem(KEY, id);
    } catch {
      // storage blocked: landing falls back to the first space
    }
  },
};

export function pickLandingSpace(spaces: { id: string }[], lastId: string | null): string | null {
  if (spaces.length === 0) return null;
  return spaces.some((s) => s.id === lastId) ? lastId : spaces[0].id;
}
