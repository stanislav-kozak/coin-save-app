import { describe, expect, it } from 'vitest';
import { getLoginRedirect } from './route-access';

describe('getLoginRedirect', () => {
  it('lets a request with a session through', () => {
    expect(getLoginRedirect('/uk', true)).toBeNull();
  });

  it('sends a protected page without a session to the login of the same locale', () => {
    expect(getLoginRedirect('/en/analytics', false)).toBe('/en/login');
    expect(getLoginRedirect('/uk', false)).toBe('/uk/login');
  });

  it('allows public pages and their sub-paths without a session', () => {
    expect(getLoginRedirect('/uk/login', false)).toBeNull();
    expect(getLoginRedirect('/en/reset-password/abc', false)).toBeNull();
    expect(getLoginRedirect('/uk/styleguide', false)).toBeNull();
  });

  it('does not treat paths that merely start like a public one as public', () => {
    expect(getLoginRedirect('/uk/login-help', false)).toBe('/uk/login');
    expect(getLoginRedirect('/uk/styleguidex', false)).toBe('/uk/login');
  });

  it('falls back to the default locale when the path has none', () => {
    expect(getLoginRedirect('/analytics', false)).toBe('/uk/login');
    expect(getLoginRedirect('/login', false)).toBeNull();
  });
});
