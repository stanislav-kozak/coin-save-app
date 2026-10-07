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

    socket.on('connect', () => {
      clearTimeout(offlineTimer);
      offlineTimer = undefined;
      setStatus('connected');
      socket.emit('space.subscribe', { spaceId: spaceRef.current });
      // Events may have been missed while away (spec §8.6, belt-and-suspenders).
      if (everConnected) void queryClient.invalidateQueries();
      everConnected = true;
    });
    socket.on('disconnect', wentOffline);
    socket.on('connect_error', (error: Error) => {
      wentOffline();
      if (error.message !== 'UNAUTHORIZED') return; // transient: Socket.IO retries with backoff
      // Denied by the server (the 15-min access token expired): the client won't retry by itself.
      const wait = lastRefresh + REFRESH_COOLDOWN_MS - Date.now();
      if (wait > 0) {
        clearTimeout(retryTimer);
        retryTimer = setTimeout(() => socket.connect(), wait);
        return;
      }
      lastRefresh = Date.now();
      // Any authenticated request refreshes the cookies (or sends a dead session to login).
      void api.GET('/api/auth/me').then(() => socket.connect());
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
