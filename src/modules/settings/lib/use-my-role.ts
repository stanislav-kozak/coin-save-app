import { useSpaces } from '@/modules/spaces';

/**
 * The current user's role here. Only the spaces list carries it (`GET /spaces/:id` has `ownerId`,
 * which names the creator, not every owner). Undefined until the list loads.
 */
export function useMyRole(spaceId: string): 'OWNER' | 'MEMBER' | undefined {
  const spaces = useSpaces();
  return spaces.data?.find((s) => s.id === spaceId)?.role;
}
