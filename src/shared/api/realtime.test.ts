import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RealtimeClient } from './realtime';

class FakeWebSocket {
  static readonly OPEN = 1;
  static instances: FakeWebSocket[] = [];

  readyState = 0;
  sent: Array<{ type: string; payload: unknown }> = [];
  onopen: (() => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;

  constructor(readonly url: string) {
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(JSON.parse(data) as { type: string; payload: unknown });
  }

  close() {
    this.readyState = 3;
  }

  // помощники для теста
  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }

  drop(code = 1006, reason = '') {
    this.readyState = 3;
    this.onclose?.({ code, reason });
  }

  receive(event: object) {
    this.onmessage?.({ data: JSON.stringify(event) });
  }
}

const last = () => FakeWebSocket.instances.at(-1)!;

describe('RealtimeClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('подписывается на комнаты после подключения и после переподключения', () => {
    const client = new RealtimeClient((token) => `ws://test/ws?token=${token}`);
    client.syncRooms([1, 2]); // ещё не подключены — запомнили
    client.connect('t1');
    expect(last().url).toBe('ws://test/ws?token=t1');

    last().open();
    expect(last().sent.map((e) => e.type)).toEqual(['room.subscribe', 'room.subscribe']);

    last().drop();
    expect(client.getStatus()).toBe('reconnecting');

    vi.advanceTimersByTime(1_000);
    expect(FakeWebSocket.instances).toHaveLength(2);
    last().open();
    expect(client.getStatus()).toBe('open');
    expect(last().sent).toEqual([
      { type: 'room.subscribe', payload: { room_id: 1 } },
      { type: 'room.subscribe', payload: { room_id: 2 } },
    ]);
  });

  it('синхронизирует подписки: новые подписывает, лишние отписывает', () => {
    const client = new RealtimeClient(() => 'ws://test');
    client.connect('t');
    last().open();
    client.syncRooms([1, 2]);
    last().sent = [];

    client.syncRooms([2, 3]);
    expect(last().sent).toEqual([
      { type: 'room.unsubscribe', payload: { room_id: 1 } },
      { type: 'room.subscribe', payload: { room_id: 3 } },
    ]);
  });

  it('раздаёт события слушателям и не переподключается после disconnect', () => {
    const client = new RealtimeClient(() => 'ws://test');
    const listener = vi.fn();
    client.onEvent(listener);
    client.connect('t');
    last().open();

    last().receive({ type: 'presence', payload: { user_id: 1 } });
    expect(listener).toHaveBeenCalledWith({ type: 'presence', payload: { user_id: 1 } });

    client.disconnect();
    vi.advanceTimersByTime(60_000);
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(client.getStatus()).toBe('idle');
  });

  it('send возвращает false, пока соединение не открыто', () => {
    const client = new RealtimeClient(() => 'ws://test');
    client.connect('t');
    expect(client.send('message.read', {})).toBe(false);
    last().open();
    expect(client.send('message.read', {})).toBe(true);
  });

  it('после закрытия с кодом «заблокирован» не переподключается и сообщает об этом', () => {
    const client = new RealtimeClient(() => 'ws://test');
    const terminated = vi.fn();
    client.onTerminated(terminated);
    client.connect('t');
    last().open();

    last().drop(4003, 'banned');
    vi.advanceTimersByTime(60_000);

    expect(terminated).toHaveBeenCalledWith('banned');
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(client.getStatus()).toBe('idle');
  });
});
