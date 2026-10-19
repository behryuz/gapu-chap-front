import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { applyOwnRead, roomApi } from '@/entities/room';
import { realtime } from '@/shared/api';

const MARK_READ_DELAY = 400;

interface AutoMarkReadOptions {
  roomId: number;
  latestMessageId: number | undefined;
  lastReadMessageId: number;
  /** Пользователь реально видит низ ленты: вкладка активна и лента прокручена вниз. */
  active: boolean;
}

/**
 * Отмечает комнату прочитанной до последнего сообщения, когда пользователь его видит.
 * Небольшая задержка схлопывает пачку пришедших подряд сообщений в один запрос.
 */
export function useAutoMarkRead({
  roomId,
  latestMessageId,
  lastReadMessageId,
  active,
}: AutoMarkReadOptions) {
  const queryClient = useQueryClient();
  const sentRef = useRef(0);

  useEffect(() => {
    sentRef.current = 0;
  }, [roomId]);

  useEffect(() => {
    if (
      !active ||
      !latestMessageId ||
      latestMessageId <= lastReadMessageId ||
      latestMessageId <= sentRef.current
    ) {
      return;
    }

    const timer = setTimeout(() => {
      sentRef.current = latestMessageId;
      // Сразу обновляем счётчик у себя (оптимистично), сервер подтвердит событием message.read.
      applyOwnRead(queryClient, roomId, latestMessageId);

      const sent = realtime.send('message.read', {
        room_id: roomId,
        message_id: latestMessageId,
      });
      if (!sent) {
        roomApi.markRead(roomId, latestMessageId).catch(() => {
          sentRef.current = 0; // попробуем ещё раз при следующем изменении
        });
      }
    }, MARK_READ_DELAY);

    return () => clearTimeout(timer);
  }, [active, latestMessageId, lastReadMessageId, queryClient, roomId]);
}
