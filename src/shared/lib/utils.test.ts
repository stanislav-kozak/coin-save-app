import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn with design-system tokens', () => {
  it('keeps a typography size when a text color is added', () => {
    expect(cn('text-h1', 'text-destructive')).toBe('text-h1 text-destructive');
    expect(cn('text-caption', 'text-muted-foreground')).toBe('text-caption text-muted-foreground');
  });

  it('lets a later typography size override an earlier one', () => {
    expect(cn('text-body', 'text-money')).toBe('text-money');
  });

  it('merges design radii and shadows like built-in ones', () => {
    expect(cn('rounded-card', 'rounded-control')).toBe('rounded-control');
    expect(cn('shadow-card', 'shadow-modal')).toBe('shadow-modal');
  });

  it('keeps the phone input size next to a text color', () => {
    expect(cn('text-field md:text-body', 'text-foreground')).toBe(
      'text-field md:text-body text-foreground',
    );
  });
});
