type FetchLike = (input: Request) => Promise<Response>;

/** Runs `fn` exclusively among everyone sharing the lock. */
export type Lock = <T>(fn: () => Promise<T>) => Promise<T>;

type Options = {
  refreshUrl: string;
  onAuthFailure: () => void;
  fetchImpl?: FetchLike;
  lock?: Lock;
};

// A 401 from these means "bad credentials", not "expired access token".
const NO_REFRESH_PATHS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'];

const LOCK_NAME = 'coinsave-auth-refresh';

/** In-memory FIFO lock: serialises callers within one JS realm (one tab). */
export function createLocalLock(): Lock {
  let tail: Promise<unknown> = Promise.resolve();
  return (fn) => {
    const run = tail.then(() => fn());
    tail = run.catch(() => undefined);
    return run;
  };
}

const localLock = createLocalLock();

/**
 * Cross-tab lock via the Web Locks API. The backend treats a second use of an already-rotated
 * refresh token as theft and revokes every session, so two tabs must never refresh at once.
 * Falls back to a per-tab lock where Web Locks are unavailable.
 */
export const defaultLock: Lock = <T>(fn: () => Promise<T>): Promise<T> =>
  typeof navigator !== 'undefined' && navigator.locks
    ? // request() resolves with the callback's awaited result; its typings just don't unwrap it
      (navigator.locks.request(LOCK_NAME, fn) as Promise<T>)
    : localLock(fn);

export function createRefreshingFetch({
  refreshUrl,
  onAuthFailure,
  fetchImpl = (input) => fetch(input),
  lock = defaultLock,
}: Options): FetchLike {
  async function refresh(): Promise<boolean> {
    try {
      const res = await fetchImpl(new Request(refreshUrl, { method: 'POST' }));
      return res.ok;
    } catch {
      return false;
    }
  }

  return async (input) => {
    // A Request body can be read once — keep copies for both possible retries.
    const retryAfterWait = input.clone();
    const retryAfterRefresh = input.clone();
    const response = await fetchImpl(input);

    if (response.status !== 401 || NO_REFRESH_PATHS.includes(new URL(input.url).pathname)) {
      return response;
    }

    return lock(async () => {
      // Someone (this tab or another) may have refreshed while we waited: try again before rotating.
      const again = await fetchImpl(retryAfterWait);
      if (again.status !== 401) return again;

      if (!(await refresh())) {
        onAuthFailure();
        return again;
      }
      return fetchImpl(retryAfterRefresh);
    });
  };
}
