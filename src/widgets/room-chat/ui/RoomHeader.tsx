import { useNavigate } from 'react-router';

import { DeleteRoomButton } from '@/features/delete-room';
import { LeaveRoomButton } from '@/features/leave-room';
import { getRoomTitle, isDirect, useMembersQuery } from '@/entities/room';
import type { UserRoom } from '@/entities/room';
import { UserAvatar, useIsOnline, useOnlineStore } from '@/entities/user';
import { useViewer } from '@/entities/viewer';
import { routes } from '@/shared/config';
import { cn, pluralize } from '@/shared/lib';
import { Avatar, Button, Icon } from '@/shared/ui';

import type { RoomPanel } from './RoomChat';
import styles from './RoomChat.module.css';

interface RoomHeaderProps {
  room: UserRoom;
  panel: RoomPanel;
  onTogglePanel: (panel: Exclude<RoomPanel, null>) => void;
  showBack: boolean;
}

export function RoomHeader({ room, panel, onTogglePanel, showBack }: RoomHeaderProps) {
  const viewer = useViewer();
  const navigate = useNavigate();
  const direct = isDirect(room);
  const title = getRoomTitle(room);
  const isOwner = viewer?.id === room.ownerId;

  return (
    <header className={styles.header}>
      {showBack && (
        <Button
          variant="ghost"
          size="sm"
          icon={<Icon name="back" size={20} />}
          onClick={() => void navigate(routes.home)}
          aria-label="К списку комнат"
          className={styles.back}
        />
      )}
      {room.peer ? (
        <UserAvatar userId={room.peer.id} username={room.peer.username} size={38} />
      ) : (
        <Avatar seed={`room-${room.id}`} label={title} size={38} square />
      )}
      <div className={styles.title}>
        <h1 className={styles.name}>{title}</h1>
        <span className={styles.subtitle}>
          {room.peer ? <PeerStatus peerId={room.peer.id} /> : <MembersSummary roomId={room.id} />}
        </span>
      </div>
      <div className={styles.actions}>
        <PanelButton
          icon="search"
          label="Поиск по истории"
          active={panel === 'search'}
          onClick={() => onTogglePanel('search')}
        />
        {!direct && (
          <PanelButton
            icon="users"
            label="Участники"
            active={panel === 'members'}
            onClick={() => onTogglePanel('members')}
          />
        )}
        {isOwner ? (
          <DeleteRoomButton roomId={room.id} roomName={title} />
        ) : (
          !direct && <LeaveRoomButton roomId={room.id} roomName={title} />
        )}
      </div>
    </header>
  );
}

function PeerStatus({ peerId }: { peerId: number }) {
  return useIsOnline(peerId) ? 'в сети' : 'не в сети';
}

function MembersSummary({ roomId }: { roomId: number }) {
  const members = useMembersQuery(roomId);
  const online = useOnlineStore((state) => state.users);
  const total = members.data?.length;
  if (total === undefined) {
    return '…';
  }
  const onlineCount = members.data?.filter((m) => m.userId in online).length ?? 0;
  return `${total} ${pluralize(total, ['участник', 'участника', 'участников'])}, ${onlineCount} в сети`;
}

function PanelButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: 'search' | 'users';
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      icon={<Icon name={icon} size={18} />}
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(active && styles.pressed)}
    />
  );
}
