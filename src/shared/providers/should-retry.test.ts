import { describe, expect, it } from 'vitest';
import { shouldRetryQuery } from './should-retry';

describe('shouldRetryQuery', () => {
  it('retries a failed query once', () => {
    const error = { statusCode: 500, code: 'INTERNAL_ERROR' };
    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(1, error)).toBe(false);
    expect(shouldRetryQuery(0, new TypeError('Failed to fetch'))).toBe(true);
  });

  it('does not retry a 401: the API client already tried to refresh the session', () => {
    expect(shouldRetryQuery(0, { statusCode: 401, code: 'HTTP_ERROR' })).toBe(false);
  });
});
