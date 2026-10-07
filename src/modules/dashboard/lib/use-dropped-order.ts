'use client';

import { useState } from 'react';
import { useReorderCategories } from '@/modules/categories';

/**
 * A dropped category order, shown in the same commit as the drop (React Query notifies observers a
 * macrotask later, which would first paint the old order: cards snap back, then jump). Cleared once the
 * save settles — the cache then holds the new order, or the restored old one plus `error`.
 */
export function useDroppedOrder(spaceId: string) {
  const reorder = useReorderCategories(spaceId);
  const [order, setOrder] = useState<string[] | null>(null);
  const apply = (next: string[]) => {
    setOrder(next);
    reorder.mutate(next, { onSettled: () => setOrder(null) });
  };
  return { order, apply, error: reorder.error };
}
