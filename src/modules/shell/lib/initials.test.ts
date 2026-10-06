import { describe, expect, it } from 'vitest';
import { initials } from './initials';

describe('initials', () => {
  it('uses the first letters of the first two name words', () => {
    expect(initials({ name: 'Станіслав Козак', email: 'a@b.co' })).toBe('СК');
  });
  it('uses one letter for a one-word name', () => {
    expect(initials({ name: 'Taras', email: 'a@b.co' })).toBe('T');
  });
  it('falls back to the email when there is no name', () => {
    expect(initials({ name: null, email: 'kozak@b.co' })).toBe('K');
    expect(initials({ name: '   ', email: 'kozak@b.co' })).toBe('K');
  });
});
