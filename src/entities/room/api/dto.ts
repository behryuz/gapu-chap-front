import type { Member, Room, RoomKind, UserRoom } from '../model/types';

export interface RoomDto {
  id: number;
  name: string;
  owner_id: number;
  kind: RoomKind;
  created_at: string;
}

export interface UserRoomDto extends RoomDto {
  last_read_message_id: number;
  unread_count: number;
  peer?: { id: number; username: string };
}

export interface MemberDto {
  user_id: number;
  username: string;
  first_name: string;
  last_name?: string;
  joined_at: string;
  last_read_message_id: number;
}

// Сервер говорит snake_case, код на TS — camelCase. Переводим на границе,
// чтобы формат API не расползался по компонентам.
export const mapRoom = (dto: RoomDto): Room => ({
  id: dto.id,
  name: dto.name,
  ownerId: dto.owner_id,
  kind: dto.kind,
  createdAt: dto.created_at,
});

export const mapUserRoom = (dto: UserRoomDto): UserRoom => ({
  ...mapRoom(dto),
  lastReadMessageId: dto.last_read_message_id,
  unreadCount: dto.unread_count,
  peer: dto.peer ? { id: dto.peer.id, username: dto.peer.username } : null,
});

export const mapMember = (dto: MemberDto): Member => ({
  userId: dto.user_id,
  username: dto.username,
  firstName: dto.first_name,
  lastName: dto.last_name ?? '',
  joinedAt: dto.joined_at,
  lastReadMessageId: dto.last_read_message_id,
});
