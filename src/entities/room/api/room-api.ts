import { http } from '@/shared/api';

import type { Member, Room, UserRoom } from '../model/types';
import { mapMember, mapRoom, mapUserRoom } from './dto';
import type { MemberDto, RoomDto, UserRoomDto } from './dto';

export const roomApi = {
  list: async (signal?: AbortSignal): Promise<Room[]> => {
    const data = await http.get<{ rooms: RoomDto[] }>('/api/rooms', { signal });
    return data.rooms.map(mapRoom);
  },
  mine: async (signal?: AbortSignal): Promise<UserRoom[]> => {
    const data = await http.get<{ rooms: UserRoomDto[] }>('/api/me/rooms', { signal });
    return data.rooms.map(mapUserRoom);
  },
  get: async (roomId: number, signal?: AbortSignal): Promise<Room> =>
    mapRoom(await http.get<RoomDto>(`/api/rooms/${roomId}`, { signal })),
  members: async (roomId: number, signal?: AbortSignal): Promise<Member[]> => {
    const data = await http.get<{ members: MemberDto[] }>(`/api/rooms/${roomId}/members`, {
      signal,
    });
    return data.members.map(mapMember);
  },
  create: async (name: string): Promise<Room> =>
    mapRoom(await http.post<RoomDto>('/api/rooms', { name })),
  join: (roomId: number) => http.post<void>(`/api/rooms/${roomId}/join`),
  leave: (roomId: number) => http.post<void>(`/api/rooms/${roomId}/leave`),
  remove: (roomId: number) => http.delete<void>(`/api/rooms/${roomId}`),
  /** Открыть (или создать) личный диалог с пользователем. */
  openDirect: async (userId: number): Promise<Room> =>
    mapRoom(await http.post<RoomDto>(`/api/dm/${userId}`)),
  markRead: (roomId: number, messageId: number) =>
    http.post<void>(`/api/rooms/${roomId}/read`, { message_id: messageId }),
};
