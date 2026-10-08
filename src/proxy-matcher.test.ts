// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { config } from './proxy';

describe('proxy — matcher', () => {
  // Next serves file-based icons at /icon.svg and /apple-icon: the auth gate must not catch them.
  const matches = (path: string) => new RegExp(`^${config.matcher}$`).test(path);

  it('leaves the app icons alone', () => {
    expect(matches('/apple-icon')).toBe(false);
    expect(matches('/icon.svg')).toBe(false);
  });

  it('still guards pages', () => {
    expect(matches('/en/login')).toBe(true);
    expect(matches('/uk/s/abc/analytics')).toBe(true);
  });
});
