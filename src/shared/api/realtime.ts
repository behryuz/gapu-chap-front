import { useSyncExternalStore } from 'react';

import { env } from '@/shared/config';

export type RealtimeStatus = 'idle' | 'connecting' | 'open' | 'reconnecting';

/** Конверт события сервера. Конкретные payload'ы типизируют слои выше. */
export interface ServerEvent {
  type: string;
  payload: unknown;
}

type EventListener = (event: ServerEvent) => void;
type StatusListener = (status: RealtimeStatus, previous: RealtimeStatus) => void;
type TerminatedListener = (reason: string) => void;

const MIN_RETRY_DELAY = 1_000;
const MAX_RETRY_DELAY = 30_000;
const NORMAL_CLOSURE = 1000;
/**
 * Коды закрытия 4000–4999 — для приложения. 4003 бэкенд шлёт заблокированному пользователю:
 * переподключаться бессмысленно, сервер всё равно не пустит.
 */
export const CLOSE_BANNED = 4003;

/**
 * Одно WebSocket-соединение на вкладку.
 * - переподключается с экспоненциальной задержкой и случайным разбросом (jitter),
 *   чтобы после падения сервера тысячи клиентов не пришли в одну и ту же миллисекунду;
 * - помнит, на какие комнаты подписан, и повторяет подписки после переподключения.
 */
export class RealtimeClient {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private status: RealtimeStatus = 'idle';
  private attempt = 0;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly rooms = new Set<number>();
  private readonly eventListeners = new Set<EventListener>();
  private readonly statusListeners = new Set<StatusListener>();
  private readonly terminatedListeners = new Set<TerminatedListener>();

  constructor(private readonly buildUrl: (token: string) => string) {}

  connect(token: string): void {
    if (this.token === token && this.socket) {
      return;
    }
    // Новый токен — новое соединение, но список комнат сохраняем:
    // подписки могли быть заданы до подключения.
    this.closeSocket();
    this.token = token;
    this.attempt = 0;
    this.open();
  }

  /** Полный выход: закрыть соединение и забыть подписки. */
  disconnect(): void {
    this.token = null;
    this.attempt = 0;
    this.rooms.clear();
    this.closeSocket();
    this.setStatus('idle');
  }

  /** Переподключиться сразу, не дожидаясь таймера (например, вернулась сеть). */
  reconnectNow(): void {
    if (!this.token || this.status !== 'reconnecting') {
      return;
    }
    // Попытка по таймеру может как раз висеть в состоянии CONNECTING — не плодим второй сокет.
    this.closeSocket();
    this.attempt = 0;
    this.open();
  }

  send(type: string, payload: unknown): boolean {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return false;
    }
    this.socket.send(JSON.stringify({ type, payload }));
    return true;
  }

  /** Привести подписки к нужному набору комнат: лишние отписать, новые подписать. */
  syncRooms(roomIds: Iterable<number>): void {
    const next = new Set(roomIds);

    for (const id of this.rooms) {
      if (!next.has(id)) {
        this.rooms.delete(id);
        this.send('room.unsubscribe', { room_id: id });
      }
    }
    for (const id of next) {
      if (!this.rooms.has(id)) {
        this.rooms.add(id);
        this.send('room.subscribe', { room_id: id });
      }
    }
  }

  get isOpen(): boolean {
    return this.status === 'open';
  }

  getStatus = (): RealtimeStatus => this.status;

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  /** Сервер закрыл соединение окончательно (например, бан) — переподключения не будет. */
  onTerminated(listener: TerminatedListener): () => void {
    this.terminatedListeners.add(listener);
    return () => this.terminatedListeners.delete(listener);
  }

  private closeSocket(): void {
    clearTimeout(this.retryTimer);
    const socket = this.socket;
    this.socket = null;
    if (socket) {
      // Снимаем обработчики заранее, чтобы закрытие не запустило переподключение.
      socket.onopen = null;
      socket.onclose = null;
      socket.onmessage = null;
      socket.close(NORMAL_CLOSURE, 'client disconnect');
    }
  }

  private open(): void {
    if (!this.token) {
      return;
    }
    this.setStatus(this.attempt === 0 ? 'connecting' : 'reconnecting');

    const socket = new WebSocket(this.buildUrl(this.token));
    this.socket = socket;

    socket.onopen = () => {
      this.attempt = 0;
      this.setStatus('open');
      for (const id of this.rooms) {
        this.send('room.subscribe', { room_id: id });
      }
    };

    socket.onmessage = (message: MessageEvent) => {
      if (typeof message.data !== 'string') {
        return;
      }
      let event: ServerEvent;
      try {
        event = JSON.parse(message.data) as ServerEvent;
      } catch {
        return;
      }
      if (typeof event?.type !== 'string') {
        return;
      }
      for (const listener of this.eventListeners) {
        listener(event);
      }
    };

    socket.onclose = (event: CloseEvent) => {
      // Закрылся старый сокет, который мы уже заменили, — игнорируем.
      if (this.socket !== socket) {
        return;
      }
      this.socket = null;
      if (event.code === CLOSE_BANNED) {
        this.disconnect();
        for (const listener of this.terminatedListeners) {
          listener(event.reason || 'banned');
        }
        return;
      }
      if (this.token) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect(): void {
    this.setStatus('reconnecting');
    const base = Math.min(MAX_RETRY_DELAY, MIN_RETRY_DELAY * 2 ** this.attempt);
    const delay = base / 2 + Math.random() * (base / 2);
    this.attempt += 1;
    this.retryTimer = setTimeout(() => this.open(), delay);
  }

  private setStatus(status: RealtimeStatus): void {
    if (this.status === status) {
      return;
    }
    const previous = this.status;
    this.status = status;
    for (const listener of this.statusListeners) {
      listener(status, previous);
    }
  }
}

export const realtime = new RealtimeClient(
  (token) => `${env.wsUrl}?token=${encodeURIComponent(token)}`,
);

const subscribeStatus = (onChange: () => void) => realtime.onStatus(onChange);

export function useRealtimeStatus(): RealtimeStatus {
  return useSyncExternalStore(subscribeStatus, realtime.getStatus);
}
