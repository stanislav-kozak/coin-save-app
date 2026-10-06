import { afterEach, describe, expect, it, vi } from 'vitest';
import { pendingEmail } from './pending-email';

describe('pendingEmail', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('remembers the email for this tab', () => {
    pendingEmail.set('a@b.co');
    expect(pendingEmail.get()).toBe('a@b.co');
  });

  it('returns null when storage is unavailable instead of throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(pendingEmail.get()).toBeNull();
  });

  it('swallows write failures', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    expect(() => pendingEmail.set('a@b.co')).not.toThrow();
  });
});
