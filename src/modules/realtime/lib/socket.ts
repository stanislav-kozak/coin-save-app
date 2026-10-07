import { io, type Socket } from 'socket.io-client';

/**
 * Same-origin `/socket.io` (Caddy on prod, the Next rewrite in dev): the browser sends the httpOnly
 * auth cookies with the handshake — the frontend never handles tokens (spec §5.6).
 */
export function createSocket(): Socket {
  return io({
    path: '/socket.io',
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: false,
  });
}
