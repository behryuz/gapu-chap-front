import { useMemo } from 'react';

import { StartDirectChatButton } from '@/features/start-direct-chat';
import { useMembersQuery } from '@/entities/room';
import { UserAvatar, useOnlineStore } from '@/entities/user';
import { useViewer } from '@/entities/viewer';
import { getErrorMessage } from '@/shared/api';
import { pluralize } from '@/shared/lib';
import { Button, Icon, Spinner } from '@/shared/ui';

import styles from './MembersPanel.module.css';

interface MembersPanelProps {
  roomId: number;
  ownerId: number;
  onClose: () => void;
}

export function MembersPanel({ roomId, ownerId, onClose }: MembersPanelProps) {
  const query = useMembersQuery(roomId);
  const viewer = useViewer();
  const online = useOnlineStore((state) => state.users);

  const members = useMemo(
    () =>
      [...(query.data ?? [])].sort((a, b) => {
        const byOnline = Number(b.userId in online) - Number(a.userId in online);
        return byOnline || a.username.localeCompare(b.username);
      }),
    [query.data, online],
  );
  const onlineCount = members.filter((m) => m.userId in online).length;

  return (
    <aside className={styles.panel} aria-label="Участники комнаты">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Участники</h2>
          {query.data && (
            <span className={styles.subtitle}>
              {members.length} {pluralize(members.length, ['участник', 'участника', 'участников'])}
              {' · '}
              {onlineCount} в сети
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<Icon name="close" size={18} />}
          onClick={onClose}
          aria-label="Скрыть участников"
        />
      </header>

      {query.isPending ? (
        <div className={styles.loader}>
          <Spinner label="Загрузка участников" />
        </div>
      ) : query.isError ? (
        <p className={styles.note}>{getErrorMessage(query.error)}</p>
      ) : (
        <ul className={styles.list}>
          {members.map((member) => {
            const isOnline = member.userId in online;
            const fullName = [member.firstName, member.lastName].filter(Boolean).join(' ');
            return (
              <li key={member.userId} className={styles.member}>
                <UserAvatar userId={member.userId} username={member.username} size={34} />
                <div className={styles.info}>
                  <span className={styles.name}>
                    {fullName || member.username}
                    {member.userId === ownerId && (
                      <span className={styles.owner} title="Создатель комнаты">
                        <Icon name="crown" size={13} />
                      </span>
                    )}
                  </span>
                  <span className={styles.meta}>
                    @{member.username} · {isOnline ? 'в сети' : 'не в сети'}
                  </span>
                </div>
                {member.userId !== viewer?.id && (
                  <StartDirectChatButton userId={member.userId} username={member.username} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
