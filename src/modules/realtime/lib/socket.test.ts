import { describe, expect, it, vi } from 'vitest';

const io = vi.fn((options: unknown) => ({ options }));
vi.mock('socket.io-client', () => ({ io: (options: unknown) => io(options) }));

describe('createSocket', () => {
  it('can fall back to long-polling when WebSockets are blocked (spec §8.6)', async () => {
    const { createSocket } = await import('./socket');
    createSocket();
    const opts = io.mock.calls[0]![0] as unknown as {
      transports?: string[];
      tryAllTransports?: boolean;
    };
    // Default transports start with polling and upgrade; a websocket-first list needs tryAllTransports.
    expect(!opts.transports || opts.tryAllTransports === true).toBe(true);
    expect(opts).toMatchObject({ path: '/socket.io', withCredentials: true, autoConnect: false });
  });
});
