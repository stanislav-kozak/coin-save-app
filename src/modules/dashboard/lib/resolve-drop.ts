export const walletDndId = (id: string) => `wallet:${id}`;
/** A wallet as a drop target (its draggable id is `wallet:…`; one node can't share an id). */
export const walletTargetDndId = (id: string) => `walletTarget:${id}`;
export const categoryDndId = (id: string) => `category:${id}`;

const parse = (id: string | null, kind: 'wallet' | 'walletTarget' | 'category') =>
  id?.startsWith(`${kind}:`) && id.length > kind.length + 1 ? id.slice(kind.length + 1) : null;

export type Drop =
  | { kind: 'expense'; walletId: string; categoryId: string }
  | { kind: 'transfer'; fromWalletId: string; toWalletId: string };

/**
 * A wallet dropped on a category → the expense to create; on another wallet → the transfer;
 * anything else (incl. a wallet back on itself) → null.
 */
export function resolveDrop(activeId: string | null, overId: string | null): Drop | null {
  const walletId = parse(activeId, 'wallet');
  if (!walletId) return null;
  const categoryId = parse(overId, 'category');
  if (categoryId) return { kind: 'expense', walletId, categoryId };
  const toWalletId = parse(overId, 'walletTarget');
  if (toWalletId && toWalletId !== walletId) {
    return { kind: 'transfer', fromWalletId: walletId, toWalletId };
  }
  return null;
}
