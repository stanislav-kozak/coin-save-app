export const walletDndId = (id: string) => `wallet:${id}`;
export const categoryDndId = (id: string) => `category:${id}`;

const parse = (id: string | null, kind: 'wallet' | 'category') =>
  id?.startsWith(`${kind}:`) && id.length > kind.length + 1 ? id.slice(kind.length + 1) : null;

/** A wallet dropped on a category → the expense to create; anything else → null. */
export function resolveDrop(activeId: string | null, overId: string | null) {
  const walletId = parse(activeId, 'wallet');
  const categoryId = parse(overId, 'category');
  return walletId && categoryId ? { walletId, categoryId } : null;
}
