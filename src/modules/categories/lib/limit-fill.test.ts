import { describe, expect, it } from 'vitest';
import { limitFill } from './limit-fill';

describe('limitFill', () => {
  it('has no fill without a limit', () => {
    expect(limitFill('500', null)).toBeNull();
  });

  it('fills by the share of the limit, capped at the top', () => {
    expect(limitFill('0', '1000')!.height).toBe(0);
    expect(limitFill('250', '1000')!.height).toBe(25);
    expect(limitFill('1500', '1000')!.height).toBe(100);
  });

  it('shades from green through yellow and orange to red', () => {
    expect(limitFill('0', '100')!.color).toBe('var(--color-success)');
    expect(limitFill('50', '100')!.color).toBe('var(--color-warning)');
    expect(limitFill('80', '100')!.color).toBe('var(--color-caution)');
    expect(limitFill('100', '100')!.color).toBe('var(--color-destructive)');
    expect(limitFill('140', '100')!.color).toBe('var(--color-destructive)');
    // in between: a mix of the two neighbouring stops
    expect(limitFill('25', '100')!.color).toBe(
      'color-mix(in oklch, var(--color-success), var(--color-warning) 50%)',
    );
    expect(limitFill('90', '100')!.color).toBe(
      'color-mix(in oklch, var(--color-caution), var(--color-destructive) 50%)',
    );
  });
});
