import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSheetKeyboard } from './use-sheet-keyboard';

/** A visual viewport we can resize, like an on-screen keyboard does. */
function fakeViewport(height: number) {
  const listeners = new Map<string, () => void>();
  const vv = {
    height,
    offsetTop: 0,
    addEventListener: (type: string, fn: () => void) => listeners.set(type, fn),
    removeEventListener: (type: string) => listeners.delete(type),
  };
  vi.stubGlobal('visualViewport', vv);
  return {
    keyboard(px: number) {
      vv.height = window.innerHeight - px;
      listeners.get('resize')?.();
    },
  };
}

const scrollTo = vi.fn();
beforeEach(() => {
  scrollTo.mockReset();
  vi.stubGlobal('scrollTo', scrollTo);
  vi.stubGlobal('innerHeight', 844);
  vi.stubGlobal('scrollY', 640);
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.removeAttribute('style');
});

describe('useSheetKeyboard', () => {
  it('pins the page where it was while a dialog is open, and puts it back on close', () => {
    fakeViewport(844);
    const { unmount } = renderHook(() => useSheetKeyboard());
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-640px');
    unmount();
    expect(document.body.style.position).toBe('');
    expect(scrollTo).toHaveBeenCalledWith({ top: 640, behavior: 'instant' });
  });

  it('keeps the page pinned until the last of stacked dialogs closes', () => {
    fakeViewport(844);
    const editor = renderHook(() => useSheetKeyboard());
    const confirm = renderHook(() => useSheetKeyboard());
    confirm.unmount();
    expect(document.body.style.position).toBe('fixed');
    editor.unmount();
    expect(document.body.style.position).toBe('');
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it('tells the sheet how much the keyboard covers, so it sits on top of it', () => {
    const viewport = fakeViewport(844);
    const { unmount } = renderHook(() => useSheetKeyboard());
    const root = document.documentElement.style;
    expect(root.getPropertyValue('--keyboard-inset')).toBe('0px');
    viewport.keyboard(320);
    expect(root.getPropertyValue('--keyboard-inset')).toBe('320px');
    expect(root.getPropertyValue('--viewport-height')).toBe('524px');
    unmount();
    expect(root.getPropertyValue('--keyboard-inset')).toBe('');
  });
});
