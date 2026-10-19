import { useQuery } from '@tanstack/react-query';

import { roomApi } from './room-api';

export const roomKeys = {
  all: ['rooms'] as const,
  list: () => [...roomKeys.all, 'list'] as const,
  mine: () => [...roomKeys.all, 'mine'] as const,
  detail: (roomId: number) => [...roomKeys.all, 'detail', roomId] as const,
  members: (roomId: number) => [...roomKeys.all, 'members', roomId] as const,
};

export function useRoomsQuery() {
  return useQuery({
    queryKey: roomKeys.list(),
    queryFn: ({ signal }) => roomApi.list(signal),
  });
}

export function useMyRoomsQuery() {
  return useQuery({
    queryKey: roomKeys.mine(),
    queryFn: ({ signal }) => roomApi.mine(signal),
  });
}

export function useRoomQuery(roomId: number) {
  return useQuery({
    queryKey: roomKeys.detail(roomId),
    queryFn: ({ signal }) => roomApi.get(roomId, signal),
  });
}

export function useMembersQuery(roomId: number, enabled = true) {
  return useQuery({
    queryKey: roomKeys.members(roomId),
    queryFn: ({ signal }) => roomApi.members(roomId, signal),
    enabled,
  });
}
