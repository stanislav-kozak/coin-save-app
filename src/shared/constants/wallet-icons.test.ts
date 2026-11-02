import { Landmark } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { iconValue, parseIconValue, resolveIcon } from './wallet-icons';

describe('resolveIcon', () => {
  it('draws a line icon for i:<name>', () => {
    expect(resolveIcon('i:bank')).toEqual({ kind: 'line', Icon: Landmark, dark: false });
  });
  it('draws the currency symbol for c:<CODE>', () => {
    expect(resolveIcon('c:UAH')).toEqual({ kind: 'symbol', text: '₴', dark: false });
    expect(resolveIcon('c:PLN')).toEqual({ kind: 'symbol', text: 'zł', dark: false });
  });
  it('keeps an emoji as it is (categories, older wallets)', () => {
    expect(resolveIcon('🛒')).toEqual({ kind: 'text', text: '🛒' });
  });
  it('draws nothing for an unknown key rather than its raw text', () => {
    expect(resolveIcon('i:rocket')).toEqual({ kind: 'text', text: '' });
    expect(resolveIcon('c:XYZ')).toEqual({ kind: 'text', text: '' });
  });
  it('reads the dark suffix', () => {
    expect(resolveIcon('i:bank|dark')).toEqual({ kind: 'line', Icon: Landmark, dark: true });
    expect(resolveIcon('c:USD|dark')).toEqual({ kind: 'symbol', text: '$', dark: true });
    expect(parseIconValue('c:USD|dark')).toEqual({ key: 'c:USD', dark: true });
    expect(iconValue('i:bank', true)).toBe('i:bank|dark');
    expect(iconValue('', true)).toBe(''); // a color-only circle has nothing to darken
  });
});
