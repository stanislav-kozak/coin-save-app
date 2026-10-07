import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RealtimeProvider, useConnectionStatus, useMemberJoinedNotice } from './realtime-provider';

type Handler = (...args: unknown[]) => void;
class FakeSocket {
  handlers = new Map<string, Handler[]>();
  emitted: [string, unknown][] = [];
  connects = 0;
  disconnects = 0;
  active = false;
  on(event: string, h: Handler) {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), h]);
    return this;
  }
  off() {
    return this;
  }
  emit(event: string, payload: unknown) {
    this.emitted.push([event, payload]);
    return this;
  }
  connect() {
    this.connects++;
    return this;
  }
  disconnect() {
    this.disconnects++;
    return this;
  }
  trigger(event: string, ...args: unknown[]) {
    for (const h of this.handlers.get(event) ?? []) h(...args);
  }
}

let socket: FakeSocket;
vi.mock('../lib/socket', () => ({ createSocket: () => socket }));
const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

function Probe() {
  return (
    <>
      <span data-testid="status">{useConnectionStatus()}</span>
      <span data-testid="joined">{String(useMemberJoinedNotice())}</span>
    </>
  );
}

function setup(spaceId = 's1') {
  const queryClient = new QueryClient();
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
  const ui = (id: string) => (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider spaceId={id}>
        <Probe />
      </RealtimeProvider>
    </QueryClientProvider>
  );
  const view = render(ui(spaceId));
  return { invalidate, rerender: (id: string) => view.rerender(ui(id)), unmount: view.unmount };
}
const status = () => screen.getByTestId('status').textContent;

beforeEach(() => {
  socket = new FakeSocket();
  get.mockReset();
  get.mockResolvedValue({ data: { id: 'u1' } });
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('RealtimeProvider', () => {
  it('connects, joins the space and moves to the new one on switch', () => {
    const { rerender } = setup('s1');
    expect(socket.connects).toBe(1);
    act(() => socket.trigger('connect'));
    expect(socket.emitted).toEqual([['space.subscribe', { spaceId: 's1' }]]);
    rerender('s2');
    expect(socket.emitted.slice(1)).toEqual([
      ['space.unsubscribe', { spaceId: 's1' }],
      ['space.subscribe', { spaceId: 's2' }],
    ]);
  });

  it("invalidates the event's own space keys, and ignores malformed payloads", () => {
    const { invalidate } = setup();
    act(() => socket.trigger('connect'));
    act(() => socket.trigger('expense.changed', { spaceId: 's1', actorId: 'u2' }));
    expect(invalidate.mock.calls.map((c) => c[0]?.queryKey)).toEqual([
      ['expenses', 's1'],
      ['wallets', 's1'],
      ['analytics', 's1'],
    ]);
    invalidate.mockClear();
    act(() => socket.trigger('expense.changed', { actorId: 'u2' }));
    act(() => socket.trigger('wallet.changed', null));
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('reports offline only after 5 s, and refetches everything once on reconnect', () => {
    const { invalidate } = setup();
    act(() => socket.trigger('connect'));
    expect(status()).toBe('connected');
    expect(invalidate).not.toHaveBeenCalled(); // first connect: data is fresh
    act(() => socket.trigger('disconnect', 'transport close'));
    act(() => void vi.advanceTimersByTime(3000));
    expect(status()).not.toBe('disconnected');
    act(() => void vi.advanceTimersByTime(2500));
    expect(status()).toBe('disconnected');
    act(() => socket.trigger('connect'));
    expect(status()).toBe('connected');
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith();
  });

  it('refreshes the session once and reconnects when the handshake is unauthorized', async () => {
    setup();
    await act(async () => socket.trigger('connect_error', new Error('UNAUTHORIZED')));
    expect(get).toHaveBeenCalledWith('/api/auth/me');
    expect(socket.connects).toBe(2);
    await act(async () => socket.trigger('connect_error', new Error('UNAUTHORIZED')));
    expect(get).toHaveBeenCalledTimes(1); // not again within 30 s
    await act(async () => void vi.advanceTimersByTime(31_000));
    expect(socket.connects).toBe(3); // retried after the cool-down
  });

  it('shows the new-member notice for a few seconds', () => {
    const { invalidate } = setup();
    act(() => socket.trigger('member.joined', { spaceId: 's1', actorId: 'u3' }));
    expect(screen.getByTestId('joined').textContent).toBe('true');
    expect(invalidate.mock.calls.map((c) => c[0]?.queryKey)).toContainEqual(['members', 's1']);
    act(() => void vi.advanceTimersByTime(5100));
    expect(screen.getByTestId('joined').textContent).toBe('false');
  });

  it('closes the socket on unmount', () => {
    const { unmount } = setup();
    unmount();
    expect(socket.disconnects).toBe(1);
  });

  it('still reconnects when the session refresh itself fails (flaky network)', async () => {
    get.mockRejectedValue(new TypeError('Failed to fetch'));
    setup();
    await act(async () => socket.trigger('connect_error', new Error('UNAUTHORIZED')));
    expect(socket.connects).toBe(2);
  });

  it('retries any other server denial after the cool-down instead of giving up', async () => {
    setup();
    await act(async () => socket.trigger('connect_error', new Error('FORBIDDEN_ORIGIN')));
    expect(get).not.toHaveBeenCalled();
    expect(socket.connects).toBe(1);
    await act(async () => void vi.advanceTimersByTime(31_000));
    expect(socket.connects).toBe(2);
  });

  it("leaves transient errors to Socket.IO's own backoff", async () => {
    setup();
    socket.active = true; // still reconnecting by itself
    await act(async () => socket.trigger('connect_error', new Error('xhr poll error')));
    await act(async () => void vi.advanceTimersByTime(31_000));
    expect(socket.connects).toBe(1);
  });

  it("reconnects after the server drops the connection, which Socket.IO won't do by itself", async () => {
    setup();
    act(() => socket.trigger('connect'));
    await act(async () => socket.trigger('disconnect', 'io server disconnect'));
    await act(async () => void vi.advanceTimersByTime(1_000));
    expect(socket.connects).toBe(2);
  });
});
