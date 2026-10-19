import type { QueryClient } from '@tanstack/react-query';

import { roomKeys } from '../api/queries';
import type { Member, UserRoom } from './types';

// Точечные правки кеша по событиям реального времени. Перезапрашивать весь
// список ради «+1 непрочитанное» расточительно, поэтому меняем только нужное поле.

export function incrementUnread(queryClient: QueryClient, roomId: number): void {
  queryClient.setQueryData<UserRoom[]>(roomKeys.mine(), (rooms) =>
    rooms?.map((room) =>
      room.id === roomId ? { ...room, unreadCount: room.unreadCount + 1 } : room,
    ),
  );
}

/** Своё прочтение: отметка двигается только вперёд, непрочитанных становится 0. */
export function applyOwnRead(queryClient: QueryClient, roomId: number, messageId: number): void {
  queryClient.setQueryData<UserRoom[]>(roomKeys.mine(), (rooms) =>
    rooms?.map((room) =>
      room.id === roomId && messageId >= room.lastReadMessageId
        ? { ...room, lastReadMessageId: messageId, unreadCount: 0 }
        : room,
    ),
  );
}

export function applyMemberRead(
  queryClient: QueryClient,
  roomId: number,
  userId: number,
  messageId: number,
): void {
  queryClient.setQueryData<Member[]>(roomKeys.members(roomId), (members) =>
    members?.map((member) =>
      member.userId === userId && messageId > member.lastReadMessageId
        ? { ...member, lastReadMessageId: messageId }
        : member,
    ),
  );
}

/** Комнату покинули или удалили — убрать её из «моих» и сбросить связанные запросы. */
export function forgetRoom(queryClient: QueryClient, roomId: number): void {
  queryClient.setQueryData<UserRoom[]>(roomKeys.mine(), (rooms) =>
    rooms?.filter((room) => room.id !== roomId),
  );
  queryClient.removeQueries({ queryKey: roomKeys.members(roomId) });
  void queryClient.invalidateQueries({ queryKey: roomKeys.list() });
}
