import type { MessageDto } from '@/entities/message';

// Протокол сервера (см. README бэкенда, раздел WebSocket).
export interface ServerEventMap {
  'message.new': MessageDto;
  'message.read': { room_id: number; user_id: number; message_id: number };
  presence: { user_id: number; username: string; online: boolean };
  'room.subscribed': { room_id: number };
  'room.joined': { room_id: number };
  'room.left': { room_id: number };
  'room.deleted': { room_id: number };
  error: { message: string };
}

export type TypedServerEvent = {
  [K in keyof ServerEventMap]: { type: K; payload: ServerEventMap[K] };
}[keyof ServerEventMap];
