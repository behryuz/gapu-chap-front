import { formatDay, isSameDay } from '@/shared/lib';

import type { Message } from '../model/types';

export type FeedItem =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'message'; key: string; message: Message; grouped: boolean };

const GROUP_WINDOW_MS = 5 * 60_000;

/**
 * Превращает историю (от новых к старым) в ленту для отображения (от старых к новым):
 * вставляет разделители по дням и помечает сообщения, которые идут подряд
 * от одного автора в пределах 5 минут, — у них не повторяем имя и аватар.
 */
export function buildFeed(messagesNewestFirst: Message[], now: Date = new Date()): FeedItem[] {
  const items: FeedItem[] = [];
  let previous: Message | undefined;

  for (let i = messagesNewestFirst.length - 1; i >= 0; i--) {
    const message = messagesNewestFirst[i]!;
    const date = new Date(message.createdAt);
    const previousDate = previous ? new Date(previous.createdAt) : undefined;

    const newDay = !previousDate || !isSameDay(previousDate, date);
    if (newDay) {
      items.push({ kind: 'day', key: `day-${message.id}`, label: formatDay(date, now) });
    }

    const grouped =
      !newDay &&
      previous !== undefined &&
      previousDate !== undefined &&
      previous.author.id === message.author.id &&
      date.getTime() - previousDate.getTime() < GROUP_WINDOW_MS;

    items.push({ kind: 'message', key: `msg-${message.id}`, message, grouped });
    previous = message;
  }

  return items;
}
