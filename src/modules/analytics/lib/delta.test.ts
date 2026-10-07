import { describe, expect, it } from 'vitest';
import { deltaPercent } from './delta';

describe('deltaPercent', () => {
  it('is the rounded change against the previous period, or null without one', () => {
    expect(deltaPercent('120', '100')).toBe(20);
    expect(deltaPercent('80', '100')).toBe(-20);
    expect(deltaPercent('100', '100')).toBe(0);
    expect(deltaPercent('5', '0')).toBeNull();
  });
});
