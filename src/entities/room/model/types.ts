export type RoomKind = 'public' | 'direct';

export interface Room {
  id: number;
  name: string;
  ownerId: number;
  kind: RoomKind;
  createdAt: string;
}

export interface Peer {
  id: number;
  username: string;
}

/** Комната глазами текущего пользователя: с отметкой «прочитано» и счётчиком. */
export interface UserRoom extends Room {
  lastReadMessageId: number;
  unreadCount: number;
  /** Собеседник — только у личных диалогов. */
  peer: Peer | null;
}

export interface Member {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  joinedAt: string;
  lastReadMessageId: number;
}
