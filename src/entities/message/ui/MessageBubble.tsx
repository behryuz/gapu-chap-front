import { memo } from 'react';
import type { ReactNode } from 'react';

import { cn, formatTime } from '@/shared/lib';
import { Icon } from '@/shared/ui';

import type { Message } from '../model/types';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
  own: boolean;
  grouped: boolean;
  /** Кто из участников (кроме автора) уже прочитал. Показываем только у своих сообщений. */
  readers?: string[];
  /**
   * Аватар автора приходит слотом сверху (из виджета): сущность «сообщение»
   * не должна импортировать соседнюю сущность «пользователь» — правило FSD.
   */
  avatar?: ReactNode;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  own,
  grouped,
  readers = [],
  avatar,
}: MessageBubbleProps) {
  const date = new Date(message.createdAt);
  const read = readers.length > 0;

  return (
    <article
      className={cn(styles.row, own && styles.own, grouped && styles.grouped)}
      aria-label={`${message.author.username}, ${formatTime(date)}`}
    >
      {!own && (
        <span className={styles.avatar}>{!grouped && avatar}</span>
      )}
      <div className={styles.bubble}>
        {!own && !grouped && <span className={styles.author}>{message.author.username}</span>}
        <p className={styles.body}>{message.body}</p>
        <span className={styles.meta}>
          <time dateTime={message.createdAt} title={date.toLocaleString('ru-RU')}>
            {formatTime(date)}
          </time>
          {own && (
            <span
              className={cn(styles.receipt, read && styles.read)}
              title={read ? `Прочитали: ${readers.join(', ')}` : 'Доставлено'}
              aria-label={read ? `Прочитали: ${readers.join(', ')}` : 'Доставлено'}
            >
              <Icon name={read ? 'checks' : 'check'} size={15} />
            </span>
          )}
        </span>
      </div>
    </article>
  );
});
