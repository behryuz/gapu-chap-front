import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';

import { MembersPanel } from '@/widgets/members-panel';
import { RoomChat } from '@/widgets/room-chat';
import type { RoomPanel } from '@/widgets/room-chat';
import { Sidebar } from '@/widgets/sidebar';
import { MessageSearchPanel } from '@/features/search-messages';
import { getRoomTitle, isDirect, useMyRoomsQuery } from '@/entities/room';
import { useMediaQuery } from '@/shared/lib';
import { EmptyState } from '@/shared/ui';

import styles from './ChatPage.module.css';

const BASE_TITLE = 'Gapu Chap';

function parseRoomId(param: string | undefined): number | null {
  if (!param || !/^\d+$/.test(param)) {
    return null;
  }
  const id = Number(param);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function ChatPage() {
  const { roomId: param } = useParams();
  const roomId = parseRoomId(param);
  const [, setSearchParams] = useSearchParams();

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isWide = useMediaQuery('(min-width: 1200px)');
  const [panel, setPanel] = useState<RoomPanel>(isWide ? 'members' : null);

  const myRooms = useMyRoomsQuery();
  const userRoom = roomId ? myRooms.data?.find((room) => room.id === roomId) : undefined;
  // У диалога всего два участника — панель участников ему не нужна.
  const activePanel = !userRoom ? null : panel === 'members' && isDirect(userRoom) ? null : panel;

  const togglePanel = (next: Exclude<RoomPanel, null>) =>
    setPanel((current) => (current === next ? null : next));

  const showMessage = (messageId: number) => {
    setSearchParams({ message: String(messageId) });
    if (!isWide) {
      setPanel(null); // на узком экране панель закрывает ленту
    }
  };

  // Счётчик непрочитанных во вкладке браузера: «(3) Gapu Chap».
  const totalUnread = myRooms.data?.reduce((sum, room) => sum + room.unreadCount, 0) ?? 0;
  useEffect(() => {
    const prefix = totalUnread > 0 ? `(${totalUnread > 99 ? '99+' : totalUnread}) ` : '';
    document.title = userRoom
      ? `${prefix}${getRoomTitle(userRoom)} — ${BASE_TITLE}`
      : `${prefix}${BASE_TITLE}`;
  }, [totalUnread, userRoom]);

  useEffect(() => () => void (document.title = BASE_TITLE), []);

  return (
    <div
      className={styles.layout}
      data-room={param ? 'open' : 'none'}
      data-members={activePanel ? (isWide ? 'docked' : 'overlay') : 'closed'}
    >
      <div className={styles.sidebar}>
        <Sidebar />
      </div>

      <main className={styles.main}>
        {roomId ? (
          <RoomChat
            roomId={roomId}
            panel={activePanel}
            onTogglePanel={togglePanel}
            showBack={isMobile}
          />
        ) : param ? (
          <EmptyState icon="search" title="Комната не найдена" description="Неверная ссылка." />
        ) : (
          <EmptyState
            icon="chat"
            title="Выберите комнату"
            description="Откройте комнату из списка слева, создайте новую или напишите кому-нибудь лично — сообщения приходят в реальном времени."
          />
        )}
      </main>

      {activePanel && userRoom && (
        <>
          {!isWide && (
            <button
              type="button"
              className={styles.backdrop}
              aria-label="Закрыть панель"
              onClick={() => setPanel(null)}
            />
          )}
          <div className={styles.members}>
            {activePanel === 'members' ? (
              <MembersPanel
                roomId={userRoom.id}
                ownerId={userRoom.ownerId}
                onClose={() => setPanel(null)}
              />
            ) : (
              <MessageSearchPanel
                key={userRoom.id}
                roomId={userRoom.id}
                onClose={() => setPanel(null)}
                onSelect={showMessage}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
