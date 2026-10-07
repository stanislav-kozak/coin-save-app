import { defaultKeyboardCoordinateGetter, type KeyboardCoordinateGetter } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

/**
 * Arrow keys while dragging: a category jumps between its sortable neighbours (spec §6.4); a wallet
 * moves in steps towards a category — the sortable getter only handles sortable items and would
 * leave it stuck.
 */
export const keyboardCoordinates: KeyboardCoordinateGetter = (event, args) =>
  String(args.context.active?.id ?? '').startsWith('category:')
    ? sortableKeyboardCoordinates(event, args)
    : defaultKeyboardCoordinateGetter(event, args);
