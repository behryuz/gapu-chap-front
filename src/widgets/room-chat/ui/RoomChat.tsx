import { Link, useNavigate } from 'react-router';

import { JoinRoomButton } from '@/features/join-room';
import { MessageComposer } from '@/features/send-message';
import { getRoomTitle, useMyRoomsQuery, useRoomQuery } from '@/entities/room';
import { getErrorMessage, isApiError } from '@/shared/api';
import { routes } from '@/shared/config';
import { Button, EmptyState, Icon, Spinner } from '@/shared/ui';

import { MessageFeed } from './MessageFeed';
import styles from './RoomChat.module.css';
import { RoomHeader } from './RoomHeader';

/** Какая боковая панель открыта рядом с чатом. */
export type RoomPanel = 'members' | 'search' | null;

interface RoomChatProps {
  roomId: number;
  panel: RoomPanel;
  onTogglePanel: (panel: Exclude<RoomPanel, null>) => void;
  showBack: boolean;
}

export function RoomChat({ roomId, panel, onTogglePanel, showBack }: RoomChatProps) {
  const myRooms = useMyRoomsQuery();
  const userRoom = myRooms.data?.find((room) => room.id === roomId);
  const room = useRoomQuery(roomId);

  if (myRooms.isPending) {
    return <CenteredSpinner />;
  }

  if (!userRoom) {
    if (room.isPending) {
      return <CenteredSpinner />;
    }
    return (
      <section className={styles.chat}>
        {showBack && <BackBar />}
        {room.isError ? (
          <EmptyState
            icon="search"
            title={isApiError(room.error, 404) ? 'Комната не найдена' : 'Не удалось открыть комнату'}
            description={
              isApiError(room.error, 404)
                ? 'Возможно, её удалил создатель.'
                : getErrorMessage(room.error)
            }
            action={
              <Link to={routes.home} className={styles.link}>
                К списку комнат
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon="users"
            title={`«${getRoomTitle(room.data)}»`}
            description="Вы не участник этой комнаты. Вступите, чтобы читать историю и писать сообщения."
            action={<JoinRoomButton roomId={roomId} size="md" openAfterJoin={false} />}
          />
        )}
      </section>
    );
  }

  return (
    <section className={styles.chat} aria-label={`Комната ${getRoomTitle(userRoom)}`}>
      <RoomHeader
        room={userRoom}
        panel={panel}
        onTogglePanel={onTogglePanel}
        showBack={showBack}
      />
      {/* key сбрасывает состояние ленты и черновик при переходе в другую комнату */}
      <MessageFeed key={`feed-${roomId}`} room={userRoom} />
      <MessageComposer key={`composer-${roomId}`} roomId={roomId} />
    </section>
  );
}

function BackBar() {
  const navigate = useNavigate();
  return (
    <div className={styles.backBar}>
      <Button
        variant="ghost"
        size="sm"
        icon={<Icon name="back" size={18} />}
        onClick={() => void navigate(routes.home)}
      >
        Комнаты
      </Button>
    </div>
  );
}

function CenteredSpinner() {
  return (
    <div className={styles.center}>
      <Spinner size={28} label="Загрузка комнаты" />
    </div>
  );
}
