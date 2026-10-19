import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { CreateRoomForm } from '@/features/create-room';
import { JoinRoomButton } from '@/features/join-room';
import { LogoutButton } from '@/features/logout';
import { NewDirectChatDialog, StartDirectChatButton } from '@/features/start-direct-chat';
import { getRoomTitle, isDirect, RoomListItem, useMyRoomsQuery, useRoomsQuery } from '@/entities/room';
import { UserAvatar, useOnlineUsers } from '@/entities/user';
import { useIsModerator, useViewer, useViewerProfile } from '@/entities/viewer';
import { getErrorMessage, useRealtimeStatus } from '@/shared/api';
import { routes } from '@/shared/config';
import { cn } from '@/shared/lib';
import { Button, Icon, Spinner } from '@/shared/ui';

import styles from './Sidebar.module.css';

type Tab = 'mine' | 'all';

export function Sidebar() {
  const [tab, setTab] = useState<Tab>('mine');

  return (
    <aside className={styles.sidebar} aria-label="Комнаты">
      <ViewerHeader />
      <ConnectionBanner />

      <div className={styles.tabs} role="tablist" aria-label="Список комнат">
        <TabButton active={tab === 'mine'} onClick={() => setTab('mine')}>
          Мои комнаты
        </TabButton>
        <TabButton active={tab === 'all'} onClick={() => setTab('all')}>
          Все комнаты
        </TabButton>
      </div>

      <div className={styles.scroll}>
        {tab === 'mine' ? <MyRooms onBrowse={() => setTab('all')} /> : <AllRooms />}
      </div>

      <OnlineUsers />
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(styles.tab, active && styles.tabActive)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ViewerHeader() {
  const viewer = useViewer();
  const profile = useViewerProfile();
  const isModerator = useIsModerator();
  const navigate = useNavigate();
  const [newChatOpen, setNewChatOpen] = useState(false);

  if (!viewer) {
    return null;
  }
  const fullName = profile.data
    ? [profile.data.firstName, profile.data.lastName].filter(Boolean).join(' ')
    : viewer.username;

  return (
    <header className={styles.header}>
      <UserAvatar userId={viewer.id} username={viewer.username} size={38} />
      <div className={styles.viewer}>
        <span className={styles.viewerName}>{fullName}</span>
        <span className={styles.viewerMeta}>
          <span className={styles.viewerLogin}>@{viewer.username}</span>
          {isModerator && (
            <span className={styles.role} title="Модератор">
              <Icon name="shield" size={11} />
              мод
            </span>
          )}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        icon={<Icon name="message" size={18} />}
        onClick={() => setNewChatOpen(true)}
        aria-label="Новый личный диалог"
        title="Новый диалог"
      />
      {isModerator && (
        <Button
          variant="ghost"
          size="sm"
          icon={<Icon name="shield" size={18} />}
          onClick={() => void navigate(routes.moderation)}
          aria-label="Модерация"
          title="Модерация"
        />
      )}
      <LogoutButton />
      <NewDirectChatDialog open={newChatOpen} onClose={() => setNewChatOpen(false)} />
    </header>
  );
}

function ConnectionBanner() {
  const status = useRealtimeStatus();
  if (status === 'open' || status === 'idle') {
    return null;
  }
  return (
    <div className={cn(styles.banner, status === 'reconnecting' && styles.bannerWarn)} role="status">
      <Spinner size={14} />
      {status === 'connecting' ? 'Подключение…' : 'Нет соединения. Переподключаемся…'}
    </div>
  );
}

function MyRooms({ onBrowse }: { onBrowse: () => void }) {
  const query = useMyRoomsQuery();

  return (
    <div className={styles.section}>
      <CreateRoomForm />
      {query.isPending ? (
        <ListLoader />
      ) : query.isError ? (
        <p className={styles.note}>{getErrorMessage(query.error)}</p>
      ) : query.data.length === 0 ? (
        <div className={styles.emptyList}>
          <p className={styles.note}>Вы пока не состоите ни в одной комнате.</p>
          <Button variant="secondary" size="sm" onClick={onBrowse}>
            Найти комнату
          </Button>
        </div>
      ) : (
        <nav className={styles.list} aria-label="Мои комнаты">
          {query.data.map((room) => (
            <RoomListItem
              key={room.id}
              roomId={room.id}
              name={getRoomTitle(room)}
              subtitle={isDirect(room) ? 'Личный диалог' : undefined}
              unreadCount={room.unreadCount}
              avatar={
                room.peer ? (
                  <UserAvatar userId={room.peer.id} username={room.peer.username} size={36} />
                ) : undefined
              }
            />
          ))}
        </nav>
      )}
    </div>
  );
}

function AllRooms() {
  const [search, setSearch] = useState('');
  const rooms = useRoomsQuery();
  const myRooms = useMyRoomsQuery();
  const viewer = useViewer();

  const memberOf = useMemo(() => new Set(myRooms.data?.map((r) => r.id)), [myRooms.data]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (rooms.data ?? []).filter((room) => room.name.toLowerCase().includes(needle));
  }, [rooms.data, search]);

  return (
    <div className={styles.section}>
      <label className={styles.search}>
        <Icon name="search" size={16} />
        <input
          type="search"
          placeholder="Поиск комнаты"
          aria-label="Поиск комнаты"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {rooms.isPending ? (
        <ListLoader />
      ) : rooms.isError ? (
        <p className={styles.note}>{getErrorMessage(rooms.error)}</p>
      ) : filtered.length === 0 ? (
        <p className={styles.note}>{search ? 'Ничего не найдено.' : 'Комнат пока нет — создайте первую.'}</p>
      ) : (
        <div className={styles.list}>
          {filtered.map((room) =>
            memberOf.has(room.id) ? (
              <RoomListItem
                key={room.id}
                roomId={room.id}
                name={room.name}
                subtitle={room.ownerId === viewer?.id ? 'Вы создатель' : 'Вы участник'}
              />
            ) : (
              <RoomListItem
                key={room.id}
                roomId={room.id}
                name={room.name}
                asLink={false}
                trailing={<JoinRoomButton roomId={room.id} />}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function OnlineUsers() {
  const users = useOnlineUsers();
  const viewer = useViewer();
  const [open, setOpen] = useState(true);
  const others = users.filter((u) => u.id !== viewer?.id);

  return (
    <section className={styles.online}>
      <button
        type="button"
        className={styles.onlineToggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.onlineDot} />
        В сети · {others.length}
        <Icon name="back" size={14} className={cn(styles.chevron, open && styles.chevronOpen)} />
      </button>
      {open && (
        <ul className={styles.onlineList}>
          {others.length === 0 && <li className={styles.note}>Кроме вас — никого.</li>}
          {others.map((user) => (
            <li key={user.id} className={styles.onlineUser}>
              <UserAvatar userId={user.id} username={user.username} size={26} />
              <span className={styles.onlineName}>{user.username}</span>
              <StartDirectChatButton userId={user.id} username={user.username} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ListLoader() {
  return (
    <div className={styles.loader}>
      <Spinner label="Загрузка" />
    </div>
  );
}
