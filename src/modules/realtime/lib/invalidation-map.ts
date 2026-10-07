import type { QueryKey } from '@tanstack/react-query';

/** Invalidation events the backend broadcasts to a space's room (payload `{ spaceId, actorId }`). */
export const REALTIME_EVENTS = [
  'wallet.changed',
  'category.changed',
  'expense.changed',
  'recurring.changed',
  'space.changed',
  'member.joined',
] as const;

export type RealtimeEvent = (typeof REALTIME_EVENTS)[number];

/**
 * Spec §8.5: which cached data an event makes stale. Prefixes `[name, spaceId]` cover every period
 * (`['expenses', spaceId, from, to]`) and variant (`…, 'all'`). Scoped to the event's own space.
 */
export function keysFor(event: RealtimeEvent, spaceId: string): QueryKey[] {
  switch (event) {
    case 'wallet.changed':
      return [
        ['wallets', spaceId],
        ['expenses', spaceId],
      ];
    case 'category.changed':
      return [
        ['categories', spaceId],
        ['analytics', spaceId],
      ];
    case 'expense.changed':
      return [
        ['expenses', spaceId],
        ['wallets', spaceId],
        ['analytics', spaceId],
      ];
    case 'recurring.changed':
      return [['recurring', spaceId]];
    case 'space.changed':
      // ['spaces'] also covers ['spaces', spaceId] (name, currency) by prefix.
      return [['spaces'], ['members', spaceId], ['invitations', spaceId]];
    case 'member.joined':
      return [
        ['members', spaceId],
        ['invitations', spaceId],
      ];
  }
}
