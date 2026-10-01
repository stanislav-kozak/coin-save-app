import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from './api-client';

describe('createApiClient', () => {
  it('calls the typed path on the given base URL and parses JSON', async () => {
    const fetchImpl = vi.fn(async (r: Request) => {
      expect(r.url).toBe('http://localhost/api/health');
      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
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
    const fetchImpl = vi
      .fn<(r: Request) => Promise<Response>>()
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(
        new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }),
      );
    const client = createApiClient({
      baseUrl: 'http://localhost',
      onAuthFailure: vi.fn(),
      fetchImpl,
    });

    const { data } = await client.GET('/api/spaces');

    expect(data).toEqual([]);
    expect(fetchImpl.mock.calls[1][0].url).toBe('http://localhost/api/auth/refresh');
  });
});
