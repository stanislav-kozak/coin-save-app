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

/**
 * A refresh that doesn't answer by then is given up (e.g. the database is asleep). Without a limit it
 * would hold the lock forever and every other request would wait behind it: endless loading.
 */
export const REFRESH_TIMEOUT_MS = 10_000;

/**
 * `rejected`: the server ended the session (401/403), so sign out. `unavailable`: no answer, a
 * network error or a 5xx; the server keeps the cookies then, so /login would just bounce back.
 */
type RefreshOutcome = 'refreshed' | 'rejected' | 'unavailable';

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
  // When the last refresh came back unavailable. Requests that were already waiting then share that
  // outcome instead of each waiting out another timeout; a later request (a retry) tries again.
  let unavailableAt = -Infinity;

  async function refresh(): Promise<RefreshOutcome> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);
    try {
      const res = await fetchImpl(
        new Request(refreshUrl, { method: 'POST', signal: controller.signal }),
      );
      if (res.ok) return 'refreshed';
      return res.status === 401 || res.status === 403 ? 'rejected' : 'unavailable';
    } catch {
      return 'unavailable';
    } finally {
      clearTimeout(timer);
    }
  }

  return async (input) => {
    // A Request body can be read once — keep copies for both possible retries.
    const retryAfterWait = input.clone();
    const retryAfterRefresh = input.clone();
    const startedAt = performance.now();
    const response = await fetchImpl(input);

    if (response.status !== 401 || NO_REFRESH_PATHS.includes(new URL(input.url).pathname)) {
      return response;
    }

    return lock(async () => {
      // Someone (this tab or another) may have refreshed while we waited: try again before rotating.
      const again = await fetchImpl(retryAfterWait);
      if (again.status !== 401) return again;

      if (unavailableAt > startedAt) return again;
      const outcome = await refresh();
      if (outcome === 'unavailable') unavailableAt = performance.now();
      if (outcome === 'refreshed') return fetchImpl(retryAfterRefresh);
      if (outcome === 'rejected') onAuthFailure();
      // Unavailable: keep the session; the 401 reaches the page, which offers a retry.
      return again;
    });
  };
}
