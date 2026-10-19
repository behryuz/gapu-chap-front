import { http } from '@/shared/api';
import { limits } from '@/shared/config';

import type { HistoryPage, Message } from '../model/types';
import { mapMessage } from './dto';
import type { MessageDto } from './dto';

// История и поиск отвечают в одном формате и листаются одним курсором `before`.
async function fetchPage(
  path: string,
  params: URLSearchParams,
  before: number | undefined,
  signal?: AbortSignal,
): Promise<HistoryPage> {
  params.set('limit', String(limits.historyPageSize));
  if (before) {
    params.set('before', String(before));
  }
  const data = await http.get<{ messages: MessageDto[]; next_before?: number }>(
    `${path}?${params}`,
    { signal },
  );
  const messages = data.messages.map(mapMessage);
  // Неполная страница — значит, дальше ничего нет: экономим лишний запрос.
  const hasMore = messages.length === limits.historyPageSize && data.next_before !== undefined;
  return { messages, nextBefore: hasMore ? (data.next_before ?? null) : null };
}

export const messageApi = {
  history: (roomId: number, before: number | undefined, signal?: AbortSignal) =>
    fetchPage(`/api/rooms/${roomId}/messages`, new URLSearchParams(), before, signal),
  search: (roomId: number, query: string, before: number | undefined, signal?: AbortSignal) =>
    fetchPage(
      `/api/rooms/${roomId}/messages/search`,
      new URLSearchParams({ q: query }),
      before,
      signal,
    ),
  send: async (roomId: number, body: string): Promise<Message> =>
    mapMessage(await http.post<MessageDto>(`/api/rooms/${roomId}/messages`, { body })),
};
