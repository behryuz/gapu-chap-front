import { describe, expect, it } from 'vitest';

import type { Message } from '../model/types';
import { buildFeed } from './feed';

const msg = (id: number, authorId: number, createdAt: string): Message => ({
  id,
  roomId: 1,
  author: { id: authorId, username: `u${authorId}` },
  body: 'x',
  createdAt,
});

describe('buildFeed', () => {
  const now = new Date(2026, 9, 16, 18, 0);

  it('идёт от старых к новым, с разделителями дней и группировкой', () => {
    const newestFirst = [
      msg(4, 2, new Date(2026, 9, 16, 10, 3).toISOString()),
      msg(3, 1, new Date(2026, 9, 16, 10, 2).toISOString()),
      msg(2, 1, new Date(2026, 9, 16, 10, 0).toISOString()),
      msg(1, 1, new Date(2026, 9, 15, 23, 59).toISOString()),
    ];

    const feed = buildFeed(newestFirst, now).map((item) =>
      item.kind === 'day' ? item.label : `${item.message.id}${item.grouped ? 'g' : ''}`,
    );

    expect(feed).toEqual(['Вчера', '1', 'Сегодня', '2', '3g', '4']);
  });

  it('не группирует сообщения с паузой больше 5 минут', () => {
    const newestFirst = [
      msg(2, 1, new Date(2026, 9, 16, 10, 10).toISOString()),
      msg(1, 1, new Date(2026, 9, 16, 10, 0).toISOString()),
    ];
    const grouped = buildFeed(newestFirst, now)
      .filter((item) => item.kind === 'message')
      .map((item) => item.grouped);

    expect(grouped).toEqual([false, false]);
  });
});
