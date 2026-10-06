import { describe, expect, it, vi } from 'vitest';
import { createApiClient, redirectToLogin } from './api-client';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('createApiClient', () => {
  it('calls the typed path on the given base URL and parses JSON', async () => {
    const fetchImpl = vi.fn(async (r: Request) => {
      expect(r.url).toBe('http://localhost/api/health');
      return json({ status: 'ok' });
    });
    const client = createApiClient({
      baseUrl: 'http://localhost',
      onAuthFailure: vi.fn(),
      fetchImpl,
    });

    const { data, error } = await client.GET('/api/health');

    expect(error).toBeUndefined();
    expect(data).toMatchObject({ status: 'ok' });
  });

  it('goes through refresh-and-retry', async () => {
    let refreshed = false;
    const fetchImpl = vi.fn(async (r: Request) => {
      if (r.url === 'http://localhost/api/auth/refresh') {
        refreshed = true;
        return json({});
      }
      return refreshed ? json([]) : json({ code: 'HTTP_ERROR' }, 401);
    });
    const client = createApiClient({
      baseUrl: 'http://localhost',
      onAuthFailure: vi.fn(),
      fetchImpl,
    });

    const { data } = await client.GET('/api/spaces');

    expect(data).toEqual([]);
    expect(refreshed).toBe(true);
  });
});

describe('redirectToLogin', () => {
  it('sends a protected page to the login of its locale', () => {
    const assign = vi.fn();
    redirectToLogin({ pathname: '/en/analytics', assign });
    expect(assign).toHaveBeenCalledWith('/en/login');
  });

  it('does nothing on a public page, so a failed session check there cannot reload-loop', () => {
    const assign = vi.fn();
    redirectToLogin({ pathname: '/uk/login', assign });
    redirectToLogin({ pathname: '/en/verify-email/token', assign });
    expect(assign).not.toHaveBeenCalled();
  });
});
