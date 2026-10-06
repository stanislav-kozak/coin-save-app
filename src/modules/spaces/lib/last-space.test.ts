import { afterEach, describe, expect, it, vi } from 'vitest';
import { lastSpace, pickLandingSpace } from './last-space';

describe('pickLandingSpace', () => {
  const spaces = [{ id: 'a' }, { id: 'b' }];
  it('reopens the last space when it is still available', () => {
    expect(pickLandingSpace(spaces, 'b')).toBe('b');
  });
  it('falls back to the first space when the last one is gone', () => {
    expect(pickLandingSpace(spaces, 'deleted')).toBe('a');
    expect(pickLandingSpace(spaces, null)).toBe('a');
  });
  it('returns null when there are no spaces', () => {
    expect(pickLandingSpace([], 'a')).toBeNull();
  });
});

describe('lastSpace', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });
  it('remembers the last opened space', () => {
    lastSpace.set('sp1');
    expect(lastSpace.get()).toBe('sp1');
  });
  it('never throws when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(lastSpace.get()).toBeNull();
    expect(() => lastSpace.set('x')).not.toThrow();
  });
});
