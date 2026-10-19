import { useInfiniteQuery } from '@tanstack/react-query';

import { messageApi } from './message-api';

export const messageKeys = {
  all: ['messages'] as const,
  room: (roomId: number) => [...messageKeys.all, roomId] as const,
  search: (roomId: number, query: string) =>
    [...messageKeys.room(roomId), 'search', query] as const,
};

export function useRoomMessages(roomId: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: messageKeys.room(roomId),
    queryFn: ({ pageParam, signal }) => messageApi.history(roomId, pageParam, signal),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextBefore ?? undefined,
    enabled,
    // Новые сообщения приходят по WebSocket, перезапрашивать историю по фокусу не нужно.
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

export function useMessageSearch(roomId: number, query: string) {
  const q = query.trim();
  return useInfiniteQuery({
    queryKey: messageKeys.search(roomId, q),
    queryFn: ({ pageParam, signal }) => messageApi.search(roomId, q, pageParam, signal),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextBefore ?? undefined,
    enabled: q.length > 0,
  });
}
