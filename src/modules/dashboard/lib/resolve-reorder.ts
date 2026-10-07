import { arrayMove } from '@dnd-kit/sortable';

const categoryId = (dndId: string | null) =>
  dndId?.startsWith('category:') ? dndId.slice('category:'.length) : null;

/** A category dropped on another category → the full new order (spec §6.4); anything else → null. */
export function resolveReorder(
  activeId: string,
  overId: string | null,
  ids: string[],
): string[] | null {
  const from = ids.indexOf(categoryId(activeId) ?? '');
  const to = ids.indexOf(categoryId(overId) ?? '');
  return from < 0 || to < 0 || from === to ? null : arrayMove(ids, from, to);
}
