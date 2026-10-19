import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import { messageKeys } from '../api/queries';
import type { HistoryPage, Message } from './types';

type HistoryData = InfiniteData<HistoryPage, number | undefined>;

/**
 * Добавить новое сообщение в начало истории (первая страница — самые свежие).
 * Одно и то же сообщение может прийти дважды — в ответе REST и событием WebSocket,
 * поэтому дубликаты по id отбрасываем.
 */
export function addMessageToCache(queryClient: QueryClient, message: Message): void {
  queryClient.setQueryData<HistoryData>(messageKeys.room(message.roomId), (data) => {
    const [first, ...rest] = data?.pages ?? [];
    if (!data || !first) {
      return data;
    }
    if (data.pages.some((page) => page.messages.some((m) => m.id === message.id))) {
      return data;
    }
    const messages = [message, ...first.messages].sort((a, b) => b.id - a.id);
    return { ...data, pages: [{ ...first, messages }, ...rest] };
  });
}
