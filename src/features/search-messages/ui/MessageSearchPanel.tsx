import { useMemo, useState } from 'react';

import { useMessageSearch } from '@/entities/message';
import { getErrorMessage } from '@/shared/api';
import { formatDay, formatTime, highlight, searchTerms, useDebouncedValue } from '@/shared/lib';
import { Button, Icon, Spinner } from '@/shared/ui';

import styles from './MessageSearchPanel.module.css';

interface MessageSearchPanelProps {
  roomId: number;
  onClose: () => void;
  /** Пользователь выбрал результат — показать это сообщение в ленте. */
  onSelect: (messageId: number) => void;
}

export function MessageSearchPanel({ roomId, onClose, onSelect }: MessageSearchPanelProps) {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query.trim());
  const terms = useMemo(() => searchTerms(debounced), [debounced]);
  // Запрос без единого слова сервер отклонит — не отправляем его вовсе.
  const search = useMessageSearch(roomId, terms.length > 0 ? debounced : '');

  const results = search.data?.pages.flatMap((page) => page.messages) ?? [];

  return (
    <aside className={styles.panel} aria-label="Поиск по истории">
      <header className={styles.header}>
        <label className={styles.field}>
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Поиск по истории"
            aria-label="Поиск по истории комнаты"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </label>
        <Button
          variant="ghost"
          size="sm"
          icon={<Icon name="close" size={18} />}
          onClick={onClose}
          aria-label="Закрыть поиск"
        />
      </header>

      <div className={styles.body}>
        {terms.length === 0 ? (
          <p className={styles.note}>Введите слово — найдём сообщения, где слова начинаются так же.</p>
        ) : search.isPending ? (
          <div className={styles.loader}>
            <Spinner label="Поиск" />
          </div>
        ) : search.isError ? (
          <p className={styles.note}>{getErrorMessage(search.error)}</p>
        ) : results.length === 0 ? (
          <p className={styles.note}>Ничего не найдено.</p>
        ) : (
          <>
            <ul className={styles.list}>
              {results.map((message) => {
                const date = new Date(message.createdAt);
                return (
                  <li key={message.id}>
                    <button
                      type="button"
                      className={styles.result}
                      onClick={() => onSelect(message.id)}
                    >
                      <span className={styles.meta}>
                        <span className={styles.author}>{message.author.username}</span>
                        <span>
                          {formatDay(date)}, {formatTime(date)}
                        </span>
                      </span>
                      <span className={styles.text}>
                        {highlight(message.body, terms).map((part, i) =>
                          part.match ? <mark key={i}>{part.text}</mark> : part.text,
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {search.hasNextPage && (
              <Button
                variant="secondary"
                size="sm"
                block
                loading={search.isFetchingNextPage}
                onClick={() => void search.fetchNextPage()}
              >
                Показать ещё
              </Button>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
