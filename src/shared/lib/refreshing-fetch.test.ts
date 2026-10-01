import { describe, expect, it, vi } from 'vitest';
import { createRefreshingFetch } from './refreshing-fetch';

const BASE = 'http://localhost';
const REFRESH = `${BASE}/api/auth/refresh`;

function respond(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), { status });
}

describe('createRefreshingFetch', () => {
  it('passes non-401 responses through untouched', async () => {
    const fetchImpl = vi.fn(async () => respond(200, { ok: true }));
    const f = createRefreshingFetch({ refreshUrl: REFRESH, onAuthFailure: vi.fn(), fetchImpl });

    const res = await f(new Request(`${BASE}/api/spaces`));

    expect(res.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('refreshes once on 401 and retries the original request', async () => {
    const fetchImpl = vi
      .fn<(r: Request) => Promise<Response>>()
      .mockResolvedValueOnce(respond(401))
      .mockResolvedValueOnce(respond(200)) // refresh
      .mockResolvedValueOnce(respond(200, { id: 'w1' })); // retry
    const f = createRefreshingFetch({ refreshUrl: REFRESH, onAuthFailure: vi.fn(), fetchImpl });

    const res = await f(new Request(`${BASE}/api/spaces`));

    expect(await res.json()).toEqual({ id: 'w1' });
    expect(fetchImpl.mock.calls[1][0].url).toBe(REFRESH);
    expect(fetchImpl.mock.calls[1][0].method).toBe('POST');
  });

  it('resends the same JSON body on retry', async () => {
    const bodies: string[] = [];
    const fetchImpl = vi.fn(async (r: Request) => {
      if (r.url === REFRESH) return respond(200);
      bodies.push(await r.text());
      return respond(bodies.length === 1 ? 401 : 201);
    });
    const f = createRefreshingFetch({ refreshUrl: REFRESH, onAuthFailure: vi.fn(), fetchImpl });

    const res = await f(
      new Request(`${BASE}/api/spaces`, {
        method: 'POST',
        body: JSON.stringify({ name: 'Family' }),
      }),
    );

    expect(res.status).toBe(201);
    expect(bodies).toEqual(['{"name":"Family"}', '{"name":"Family"}']);
  });

  it('runs a single refresh for concurrent 401s', async () => {
    let refreshed = false;
    const fetchImpl = vi.fn(async (r: Request) => {
      if (r.url === REFRESH) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        refreshed = true;
        return respond(200);
      }
      return respond(refreshed ? 200 : 401);
    });
    const f = createRefreshingFetch({ refreshUrl: REFRESH, onAuthFailure: vi.fn(), fetchImpl });

    const results = await Promise.all(
      ['a', 'b', 'c', 'd'].map((p) => f(new Request(`${BASE}/api/${p}`))),
    );

    expect(results.map((r) => r.status)).toEqual([200, 200, 200, 200]);
    expect(fetchImpl.mock.calls.filter(([r]) => r.url === REFRESH)).toHaveLength(1);
  });

  it('calls onAuthFailure and returns the 401 when refresh fails', async () => {
    const onAuthFailure = vi.fn();
    const fetchImpl = vi
      .fn<(r: Request) => Promise<Response>>()
      .mockResolvedValueOnce(respond(401))
      .mockResolvedValueOnce(respond(401)); // refresh rejected
    const f = createRefreshingFetch({ refreshUrl: REFRESH, onAuthFailure, fetchImpl });

    const res = await f(new Request(`${BASE}/api/spaces`));

    expect(res.status).toBe(401);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('treats a network error during refresh as a failed refresh', async () => {
    const onAuthFailure = vi.fn();
    const fetchImpl = vi
      .fn<(r: Request) => Promise<Response>>()
      .mockResolvedValueOnce(respond(401))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const f = createRefreshingFetch({ refreshUrl: REFRESH, onAuthFailure, fetchImpl });

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
});
