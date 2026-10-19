import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { useAutoMarkRead } from '@/features/mark-read';
import { buildFeed, MessageBubble, useRoomMessages } from '@/entities/message';
import { getRoomTitle, useMembersQuery } from '@/entities/room';
import type { UserRoom } from '@/entities/room';
import { UserAvatar } from '@/entities/user';
import { useViewer } from '@/entities/viewer';
import { getErrorMessage } from '@/shared/api';
import { usePageActive } from '@/shared/lib';
import { Button, EmptyState, Icon, Spinner, toast } from '@/shared/ui';

import styles from './MessageFeed.module.css';

/** Насколько (px) можно отъехать от низа, чтобы всё ещё считаться «внизу». */
const BOTTOM_THRESHOLD = 80;

/**
 * Лента сообщений.
 *
 * Контейнер прокрутки — `flex-direction: column-reverse`, а сообщения лежат в DOM
 * от новых к старым (ровно в том порядке, в каком их отдаёт сервер). Браузер сам держит
 * ленту прижатой к низу: новые сообщения появляются внизу без ручного scrollTop,
 * а подгрузка старых сверху не сдвигает то, что пользователь сейчас читает.
 */
export function MessageFeed({ room }: { room: UserRoom }) {
  const viewer = useViewer();
  const history = useRoomMessages(room.id);
  const members = useMembersQuery(room.id);
  const pageActive = usePageActive();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  // Граница «новых» фиксируется при открытии комнаты и не прыгает, пока мы читаем.
  const [unreadAfter] = useState(room.lastReadMessageId);

  const messages = useMemo(
    () => history.data?.pages.flatMap((page) => page.messages) ?? [],
    [history.data],
  );
  const feed = useMemo(() => buildFeed(messages), [messages]);
  const latest = messages[0];

  // Кто прочитал каждое из моих сообщений: участник (не я) с last_read >= id.
  const readersById = useMemo(() => {
    const others = (members.data ?? []).filter((m) => m.userId !== viewer?.id);
    const result = new Map<number, string[]>();
    for (const message of messages) {
      if (message.author.id !== viewer?.id) {
        continue;
      }
      result.set(
        message.id,
        others.filter((m) => m.lastReadMessageId >= message.id).map((m) => m.username),
      );
    }
    return result;
  }, [members.data, messages, viewer?.id]);

  const firstUnreadId = useMemo(() => {
    if (unreadAfter <= 0) {
      return undefined;
    }
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i]!;
      if (m.id > unreadAfter && m.author.id !== viewer?.id) {
        return m.id;
      }
    }
    return undefined;
  }, [messages, unreadAfter, viewer?.id]);

  useAutoMarkRead({
    roomId: room.id,
    latestMessageId: latest?.id,
    lastReadMessageId: room.lastReadMessageId,
    active: pageActive && atBottom && history.isSuccess,
  });

  // Своё отправленное сообщение — всегда прокручиваем к нему.
  useEffect(() => {
    if (latest && latest.author.id === viewer?.id) {
      scrollerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [latest, viewer?.id]);

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = history;

  // Переход к сообщению из поиска: ?message=<id>. Если его ещё нет в загруженной истории,
  // догружаем страницы, пока не дойдём до нужного id (история отсортирована по id).
  const [searchParams, setSearchParams] = useSearchParams();
  const targetId = Number(searchParams.get('message')) || null;

  useEffect(() => {
    if (!targetId || !history.isSuccess) {
      return;
    }
    const clearTarget = () =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('message');
          return next;
        },
        { replace: true },
      );

    if (messages.some((m) => m.id === targetId)) {
      // Прокрутка и подсветка — работа с DOM, а не состояние React: меняем элемент напрямую.
      const element = scrollerRef.current?.querySelector(`[data-message-id="${targetId}"]`);
      element?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      element?.classList.add(styles.flash!);
      setTimeout(() => element?.classList.remove(styles.flash!), 2_000);
      clearTarget();
      return;
    }

    const oldestId = messages.at(-1)?.id;
    if (hasNextPage && (oldestId === undefined || oldestId > targetId)) {
      if (!isFetchingNextPage) {
        void fetchNextPage();
      }
      return;
    }

    toast.info('Сообщение не найдено — возможно, его удалили.');
    clearTarget();
  }, [targetId, messages, history.isSuccess, hasNextPage, isFetchingNextPage, fetchNextPage, setSearchParams]);

  // Подгрузка истории, когда пользователь докрутил до верха.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scroller = scrollerRef.current;
    if (!sentinel || !scroller || !hasNextPage) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: scroller, rootMargin: '300px 0px 0px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (scroller) {
      // В column-reverse scrollTop = 0 внизу и уходит в минус при прокрутке вверх.
      setAtBottom(Math.abs(scroller.scrollTop) < BOTTOM_THRESHOLD);
    }
  };

  if (history.isPending) {
    return (
      <div className={styles.center}>
        <Spinner size={28} label="Загрузка сообщений" />
      </div>
    );
  }

  if (history.isError) {
    return (
      <div className={styles.center}>
        <EmptyState
          icon="chat"
          title="Не удалось загрузить сообщения"
          description={getErrorMessage(history.error)}
          action={
            <Button variant="secondary" onClick={() => void history.refetch()}>
              Повторить
            </Button>
          }
        />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={styles.center}>
        <EmptyState
          icon="chat"
          title="Сообщений пока нет"
          description="Напишите первым — участники увидят сообщение сразу."
        />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div
        ref={scrollerRef}
        className={styles.scroller}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Сообщения"
      >
        {[...feed].reverse().map((item) => {
          if (item.kind === 'day') {
            return (
              <div key={item.key} className={styles.day}>
                <span>{item.label}</span>
              </div>
            );
          }
          const { message, grouped } = item;
          const own = message.author.id === viewer?.id;
          return (
            <div key={item.key} className={styles.item} data-message-id={message.id}>
              <MessageBubble
                message={message}
                own={own}
                grouped={grouped && message.id !== firstUnreadId}
                readers={readersById.get(message.id)}
                avatar={
                  <UserAvatar
                    userId={message.author.id}
                    username={message.author.username}
                    size={32}
                  />
                }
              />
              {message.id === firstUnreadId && (
                <div className={styles.unreadDivider} role="separator">
                  <span>Новые сообщения</span>
                </div>
              )}
            </div>
          );
        })}

        <div ref={sentinelRef} className={styles.top}>
          {isFetchingNextPage ? (
            <Spinner label="Загрузка истории" />
          ) : (
            !hasNextPage && <span>Начало истории «{getRoomTitle(room)}»</span>
          )}
        </div>
      </div>

      {!atBottom && (
        <Button
          variant="secondary"
          className={styles.jump}
          icon={<Icon name="arrowDown" size={18} />}
          onClick={() => scrollerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="К последним сообщениям"
          title="К последним сообщениям"
        />
      )}
    </div>
  );
}
