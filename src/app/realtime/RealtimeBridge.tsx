import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router';

import { messageKeys } from '@/entities/message';
import { roomKeys, useMyRoomsQuery } from '@/entities/room';
import { fetchOnlineUsers, onlineActions } from '@/entities/user';
import { isSessionExpired, session, useSessionStore, useViewer } from '@/entities/viewer';
import { realtime } from '@/shared/api';
import { routes } from '@/shared/config';

import { endSession } from '../session/end-session';
import { handleServerEvent } from './handle-event';

/**
 * Связывает WebSocket с приложением: держит соединение, пока есть сессия,
 * подписывается на все «мои» комнаты (чтобы считать непрочитанные и в закрытых),
 * и раздаёт события в кеш. Сам ничего не рисует.
 */
export function RealtimeBridge() {
  const token = useSessionStore((state) => state.token);
  const viewer = useViewer();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const myRooms = useMyRoomsQuery();

  // Обработчик событий регистрируется один раз, а актуальные значения читает из ref.
  const contextRef = useRef({ viewerId: viewer?.id, currentRoomId: null as number | null });
  useEffect(() => {
    const match = matchPath('/rooms/:roomId', location.pathname);
    contextRef.current = {
      viewerId: viewer?.id,
      currentRoomId: match?.params.roomId ? Number(match.params.roomId) : null,
    };
  }, [location.pathname, viewer?.id]);

  // Порядок эффектов важен: сначала соединение, потом подписки.
  useEffect(() => {
    if (!token) {
      return;
    }
    realtime.connect(token);
    return () => realtime.disconnect();
  }, [token]);

  useEffect(() => {
    if (myRooms.data) {
      realtime.syncRooms(myRooms.data.map((room) => room.id));
    }
  }, [myRooms.data]);

  useEffect(
    () =>
      realtime.onEvent((event) =>
        handleServerEvent(event, {
          queryClient,
          ...contextRef.current,
          goHome: () => void navigate(routes.home, { replace: true }),
        }),
      ),
    [queryClient, navigate],
  );

  useEffect(
    () =>
      realtime.onStatus((status, previous) => {
        if (status === 'open') {
          // Снимок «кто в сети» — сразу после подключения, дальше его обновляют события.
          fetchOnlineUsers()
            .then(onlineActions.setAll)
            .catch(() => {});
          // Пока соединения не было, мы могли пропустить сообщения — догружаем.
          if (previous === 'reconnecting') {
            void queryClient.invalidateQueries({ queryKey: messageKeys.all });
            void queryClient.invalidateQueries({ queryKey: roomKeys.all });
          }
        }
        if (status === 'reconnecting' && isSessionExpired(session.getViewer())) {
          session.clear();
        }
      }),
    [queryClient],
  );

  // Сервер закрыл сокет навсегда (бан) — выходим, не дожидаясь ответа REST.
  useEffect(() => realtime.onTerminated(() => endSession('banned')), []);

  useEffect(() => {
    const reconnect = () => realtime.reconnectNow();
    window.addEventListener('online', reconnect);
    return () => window.removeEventListener('online', reconnect);
  }, []);

  return null;
}
