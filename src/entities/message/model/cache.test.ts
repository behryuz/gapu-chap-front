import { QueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { messageKeys } from '../api/queries';
import { addMessageToCache } from './cache';
import type { HistoryPage, Message } from './types';

const message = (id: number): Message => ({
  id,
  roomId: 1,
  author: { id: 1, username: 'alice' },
  body: `m${id}`,
  createdAt: '2026-10-16T10:00:00Z',
});

function ids(qc: QueryClient): number[] {
  const data = qc.getQueryData<InfiniteData<HistoryPage>>(messageKeys.room(1));
  return data?.pages.flatMap((p) => p.messages.map((m) => m.id)) ?? [];
}

describe('addMessageToCache', () => {
  it('добавляет новое сообщение в начало и не дублирует', () => {
    const qc = new QueryClient();
    qc.setQueryData(messageKeys.room(1), {
      pages: [{ messages: [message(5), message(4)], nextBefore: 4 }],
      pageParams: [undefined],
    });

    addMessageToCache(qc, message(6));
    addMessageToCache(qc, message(6));

    expect(ids(qc)).toEqual([6, 5, 4]);
  });

  it('ничего не делает, если история комнаты ещё не загружалась', () => {
    const qc = new QueryClient();
    addMessageToCache(qc, message(1));
    expect(qc.getQueryData(messageKeys.room(1))).toBeUndefined();
  });
});
