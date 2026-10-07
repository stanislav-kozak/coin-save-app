'use client';

import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { api } from '@/shared/lib/api-client';
import { keysFor, REALTIME_EVENTS } from '../lib/invalidation-map';
import { createSocket } from '../lib/socket';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

const OFFLINE_AFTER_MS = 5_000; // spec §8.6: only a lasting outage is worth a banner
const NOTICE_MS = 5_000;
const REFRESH_COOLDOWN_MS = 30_000;
const SERVER_DROP_RETRY_MS = 1_000;

const RealtimeContext = createContext<{ status: ConnectionStatus; memberJoined: boolean }>({
  status: 'connecting',
  memberJoined: false,
});

const hasSpaceId = (p: unknown): p is { spaceId: string } =>
  typeof p === 'object' && p !== null && typeof (p as { spaceId?: unknown }).spaceId === 'string';

/**
 * Spec §8: one Socket.IO connection for the app shell. It joins the current space's room and turns the
 * backend's invalidation events into React Query refetches. Own events are not skipped: the backend
 * knows the user, not the device, and your other devices must update too.
 */
export function RealtimeProvider({ spaceId, children }: { spaceId: string; children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [memberJoined, setMemberJoined] = useState(false);
  const socketRef = useRef<ReturnType<typeof createSocket> | null>(null);
  const spaceRef = useRef(spaceId);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;
    let everConnected = false;
    let offlineTimer: ReturnType<typeof setTimeout> | undefined;
    let noticeTimer: ReturnType<typeof setTimeout> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let lastRefresh = -Infinity;

    const wentOffline = () => {
      if (offlineTimer === undefined) {
        offlineTimer = setTimeout(() => setStatus('disconnected'), OFFLINE_AFTER_MS);
      }
    };
    // Socket.IO only retries by itself after transport failures. After a server denial or a
    // server-side disconnect the socket is closed for good, so reconnect explicitly.
    const retryIn = (ms: number) => {
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => socket.connect(), ms);
    };

    socket.on('connect', () => {
      clearTimeout(offlineTimer);
      offlineTimer = undefined;
      setStatus('connected');
      socket.emit('space.subscribe', { spaceId: spaceRef.current });
      // Events may have been missed while away (spec §8.6, belt-and-suspenders).
      if (everConnected) void queryClient.invalidateQueries();
      everConnected = true;
    });
    socket.on('disconnect', (reason: string) => {
      if (reason === 'io client disconnect') return; // we closed it (unmount)
      wentOffline();
      if (reason === 'io server disconnect') retryIn(SERVER_DROP_RETRY_MS);
    });
    socket.on('connect_error', (error: Error) => {
      wentOffline();
      if (socket.active) return; // transient: Socket.IO retries with backoff
      const wait = lastRefresh + REFRESH_COOLDOWN_MS - Date.now();
      if (error.message === 'UNAUTHORIZED' && wait <= 0) {
        // The 15-min access token expired (sleep, idle): any authenticated request refreshes the
        // cookies (or sends a dead session to login). Reconnect even if that request itself failed.
        lastRefresh = Date.now();
        void api
          .GET('/api/auth/me')
          .catch(() => undefined)
          .finally(() => socket.connect());
        return;
      }
      // Any other denial (or a refresh just tried): try again after the cool-down.
      retryIn(wait > 0 ? wait : REFRESH_COOLDOWN_MS);
    });
    for (const event of REALTIME_EVENTS) {
      socket.on(event, (payload: unknown) => {
        if (!hasSpaceId(payload)) return;
        for (const queryKey of keysFor(event, payload.spaceId)) {
          void queryClient.invalidateQueries({ queryKey });
        }
        if (event === 'member.joined') {
          setMemberJoined(true);
          clearTimeout(noticeTimer);
          noticeTimer = setTimeout(() => setMemberJoined(false), NOTICE_MS);
        }
      });
    }
    socket.connect();

    return () => {
      clearTimeout(offlineTimer);
      clearTimeout(noticeTimer);
      clearTimeout(retryTimer);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient]);

  // Space switch: leave the old room before joining the new one.
  useEffect(() => {
    const previous = spaceRef.current;
    if (previous === spaceId) return;
    spaceRef.current = spaceId;
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('space.unsubscribe', { spaceId: previous });
    socket.emit('space.subscribe', { spaceId });
  }, [spaceId]);

  return (
    <RealtimeContext.Provider value={{ status, memberJoined }}>{children}</RealtimeContext.Provider>
  );
}

export function useConnectionStatus(): ConnectionStatus {
  return useContext(RealtimeContext).status;
}

export function useMemberJoinedNotice(): boolean {
  return useContext(RealtimeContext).memberJoined;
}
