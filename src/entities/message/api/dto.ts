import type { Message } from '../model/types';

export interface MessageDto {
  id: number;
  room_id: number;
  author: { id: number; username: string };
  body: string;
  created_at: string;
}

export const mapMessage = (dto: MessageDto): Message => ({
  id: dto.id,
  roomId: dto.room_id,
  author: { id: dto.author.id, username: dto.author.username },
  body: dto.body,
  createdAt: dto.created_at,
});
