'use client';

import { useEffect } from 'react';

/*
 * Phones open a dialog as a bottom sheet. Without help, focusing a field in it makes the browser
 * scroll the page underneath to "reveal" the field (iOS Safari above all), so the app jumps.
 *
 * While any dialog is open:
 * - the page is pinned (`position: fixed` at its scroll offset) and put back where it was on close —
 *   overflow:hidden alone doesn't stop iOS scrolling to a focused field;
 * - `--keyboard-inset` / `--viewport-height` on <html> follow the visual viewport, so the sheet sits
 *   on top of the on-screen keyboard instead of under it, and nothing needs scrolling.
 * Dialogs stack (a confirmation over an editor): one lock is shared, counted.
 */

let locks = 0;
let savedScroll = 0;
let stopWatching: (() => void) | null = null;

function watchKeyboard(): () => void {
  const vv = window.visualViewport;
  const root = document.documentElement.style;
  if (!vv) return () => {};
  const update = () => {
    // What the keyboard (or any other overlay) covers at the bottom of the layout viewport.
    const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    root.setProperty('--keyboard-inset', `${Math.round(inset)}px`);
    root.setProperty('--viewport-height', `${Math.round(vv.height)}px`);
  };
  update();
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  return () => {
    vv.removeEventListener('resize', update);
    vv.removeEventListener('scroll', update);
    root.removeProperty('--keyboard-inset');
    root.removeProperty('--viewport-height');
  };
}

function lock() {
  locks += 1;
  if (locks > 1) return;
  savedScroll = window.scrollY;
  const body = document.body.style;
  body.position = 'fixed';
  body.top = `-${savedScroll}px`;
  body.left = '0';
  body.right = '0';
  stopWatching = watchKeyboard();
}

function unlock() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  const body = document.body.style;
  body.position = '';
  body.top = '';
  body.left = '';
  body.right = '';
  window.scrollTo({ top: savedScroll, behavior: 'instant' });
  stopWatching?.();
  stopWatching = null;
}

/** Call from a dialog's content: it only exists while the dialog is open (and closing). */
export function useSheetKeyboard() {
  useEffect(() => {
    lock();
    return unlock;
  }, []);
}

/** Focus a field without the browser scrolling anything to it (the sheet already shows it). */
export function focusWithoutScroll(id: string) {
  document.getElementById(id)?.focus({ preventScroll: true });
}
