import type { Room, UserRoom } from '../model/types';

export function isDirect(room: Pick<Room, 'kind'>): boolean {
  return room.kind === 'direct';
}

/** У диалога служебное имя (dm:1:2) — показываем имя собеседника. */
export function getRoomTitle(room: Room | UserRoom): string {
  if (isDirect(room)) {
    return 'peer' in room && room.peer ? room.peer.username : 'Личный диалог';
  }
  return room.name;
}
