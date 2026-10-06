import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLocalLock, createRefreshingFetch, defaultLock } from './refreshing-fetch';

const BASE = 'http://localhost';
const REFRESH = `${BASE}/api/auth/refresh`;

function respond(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), { status });
}

/**
 * Mimics the backend's token rotation (coin-save-api token.service): every refresh rotates the
 * refresh token, and presenting an already-rotated one is "reuse" → all sessions revoked.
 * Cookies are shared by every tab, like in a real browser.
 */
function createFakeBackend({ refreshWorks = true } = {}) {
  const state = {
    accessValid: false,
    serverRefreshToken: 1,
    cookieRefreshToken: 1,
    revoked: false,
    refreshCalls: 0,
    bodies: [] as string[],
  };

  const fetchImpl = async (r: Request): Promise<Response> => {
    if (new URL(r.url).pathname === '/api/auth/refresh') {
      state.refreshCalls++;
      const presented = state.cookieRefreshToken; // the browser attaches the cookie at send time
      await new Promise((resolve) => setTimeout(resolve, 5));
      if (!refreshWorks) return respond(401, { code: 'INVALID_REFRESH_TOKEN' });
      if (state.revoked || presented !== state.serverRefreshToken) {
        state.revoked = true;
        return respond(401, { code: 'REFRESH_TOKEN_REUSE_DETECTED' });
      }
      state.serverRefreshToken++;
      state.cookieRefreshToken = state.serverRefreshToken;
      state.accessValid = true;
      return respond(200);
    }
    state.bodies.push(await r.text());
    return respond(state.accessValid && !state.revoked ? 200 : 401, { ok: true });
  };

  return { state, fetchImpl };
}

describe('createRefreshingFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('passes non-401 responses through untouched', async () => {
    const fetchImpl = vi.fn(async () => respond(200, { ok: true }));
    const f = createRefreshingFetch({ refreshUrl: REFRESH, onAuthFailure: vi.fn(), fetchImpl });

    const res = await f(new Request(`${BASE}/api/spaces`));

    expect(res.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('refreshes on 401 and retries the original request', async () => {
    const backend = createFakeBackend();
    const f = createRefreshingFetch({
      refreshUrl: REFRESH,
      onAuthFailure: vi.fn(),
      fetchImpl: backend.fetchImpl,
      lock: createLocalLock(),
    });

    const res = await f(new Request(`${BASE}/api/spaces`));

    expect(res.status).toBe(200);
    expect(backend.state.refreshCalls).toBe(1);
  });

  it('resends the same JSON body on every retry', async () => {
    const backend = createFakeBackend();
    const f = createRefreshingFetch({
      refreshUrl: REFRESH,
      onAuthFailure: vi.fn(),
      fetchImpl: backend.fetchImpl,
      lock: createLocalLock(),
    });

    const res = await f(
      new Request(`${BASE}/api/spaces`, {
        method: 'POST',
        body: JSON.stringify({ name: 'Family' }),
      }),
    );

    expect(res.status).toBe(200);
    expect(backend.state.bodies.length).toBeGreaterThan(1);
    expect(new Set(backend.state.bodies)).toEqual(new Set(['{"name":"Family"}']));
  });

  it('runs a single refresh for concurrent 401s in one tab', async () => {
    const backend = createFakeBackend();
    const f = createRefreshingFetch({
      refreshUrl: REFRESH,
      onAuthFailure: vi.fn(),
      fetchImpl: backend.fetchImpl,
      lock: createLocalLock(),
    });

    const results = await Promise.all(
      ['a', 'b', 'c', 'd'].map((p) => f(new Request(`${BASE}/api/${p}`))),
    );

    expect(results.map((r) => r.status)).toEqual([200, 200, 200, 200]);
    expect(backend.state.refreshCalls).toBe(1);
  });

  it('does not trip refresh-token reuse detection when two tabs hit 401 together', async () => {
    const backend = createFakeBackend();
    const sharedLock = createLocalLock(); // stands in for navigator.locks, shared by all tabs
    const tabA = createRefreshingFetch({
      refreshUrl: REFRESH,
      onAuthFailure: vi.fn(),
      fetchImpl: backend.fetchImpl,
      lock: sharedLock,
    });
    const tabB = createRefreshingFetch({
      refreshUrl: REFRESH,
      onAuthFailure: vi.fn(),
      fetchImpl: backend.fetchImpl,
      lock: sharedLock,
    });

    const [a, b] = await Promise.all([
      tabA(new Request(`${BASE}/api/wallets`)),
      tabB(new Request(`${BASE}/api/wallets`)),
    ]);

    expect([a.status, b.status]).toEqual([200, 200]);
    expect(backend.state.revoked).toBe(false);
    expect(backend.state.refreshCalls).toBe(1);
  });

  it('calls onAuthFailure and returns the 401 when refresh fails', async () => {
    const backend = createFakeBackend({ refreshWorks: false });
    const onAuthFailure = vi.fn();
    const f = createRefreshingFetch({
      refreshUrl: REFRESH,
      onAuthFailure,
      fetchImpl: backend.fetchImpl,
      lock: createLocalLock(),
    });

    const res = await f(new Request(`${BASE}/api/spaces`));

    expect(res.status).toBe(401);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it('treats a network error during refresh as a failed refresh', async () => {
    const onAuthFailure = vi.fn();
    const fetchImpl = vi.fn(async (r: Request) => {
      if (r.url === REFRESH) throw new TypeError('Failed to fetch');
      return respond(401);
    });
    const f = createRefreshingFetch({
      refreshUrl: REFRESH,
      onAuthFailure,
      fetchImpl,
      lock: createLocalLock(),
    });

    const res = await f(new Request(`${BASE}/api/spaces`));

    expect(res.status).toBe(401);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it.each(['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'])(
    'does not try to refresh after a 401 from %s',
    async (path) => {
      const onAuthFailure = vi.fn();
      const fetchImpl = vi.fn(async () => respond(401));
      const f = createRefreshingFetch({ refreshUrl: REFRESH, onAuthFailure, fetchImpl });

      const res = await f(new Request(`${BASE}${path}`, { method: 'POST' }));

      expect(res.status).toBe(401);
      expect(fetchImpl).toHaveBeenCalledTimes(1);
      expect(onAuthFailure).not.toHaveBeenCalled();
    },
  );

  it('uses the cross-tab Web Locks API by default when the browser has it', async () => {
    const request = vi.fn((_name: string, fn: () => Promise<unknown>) => fn());
    vi.stubGlobal('navigator', { locks: { request } });

    await defaultLock(async () => 'done');

    expect(request).toHaveBeenCalledWith('coinsave-auth-refresh', expect.any(Function));
  });
});
