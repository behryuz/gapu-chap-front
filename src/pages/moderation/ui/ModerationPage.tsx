import { useState } from 'react';
import { useNavigate } from 'react-router';

import { BanToggleButton } from '@/features/ban-user';
import { getFullName, UserAvatar, useUserSearch } from '@/entities/user';
import { useIsModerator, useViewer, useViewerProfile } from '@/entities/viewer';
import { getErrorMessage } from '@/shared/api';
import { routes } from '@/shared/config';
import { useDebouncedValue } from '@/shared/lib';
import { Button, EmptyState, Icon, Spinner, TextField } from '@/shared/ui';

import styles from './ModerationPage.module.css';

export function ModerationPage() {
  const navigate = useNavigate();
  const profile = useViewerProfile();
  const isModerator = useIsModerator();
  const viewer = useViewer();
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query);
  const search = useUserSearch(isModerator ? debounced : '');

  const back = (
    <Button
      variant="ghost"
      size="sm"
      icon={<Icon name="back" size={18} />}
      onClick={() => void navigate(routes.home)}
    >
      К чату
    </Button>
  );

  if (profile.isPending) {
    return (
      <main className={styles.center}>
        <Spinner size={28} label="Загрузка" />
      </main>
    );
  }

  // Скрытие кнопки — только удобство. Настоящая проверка прав — на сервере.
  if (!isModerator) {
    return (
      <main className={styles.center}>
        <EmptyState
          icon="shield"
          title="Нет доступа"
          description="Этот раздел доступен только модераторам."
          action={back}
        />
      </main>
    );
  }

  const users = search.data ?? [];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          {back}
          <h1 className={styles.title}>
            <Icon name="shield" size={22} />
            Модерация
          </h1>
        </header>

        <TextField
          aria-label="Поиск пользователя"
          placeholder="Найти пользователя по имени или @username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        <section className={styles.results} aria-live="polite">
          {!debounced.trim() ? (
            <p className={styles.note}>
              Заблокированный пользователь сразу отключается от чата и не может войти снова, пока
              блокировку не снимут. Других модераторов блокировать нельзя.
            </p>
          ) : search.isPending ? (
            <div className={styles.loader}>
              <Spinner label="Поиск" />
            </div>
          ) : search.isError ? (
            <p className={styles.note}>{getErrorMessage(search.error)}</p>
          ) : users.length === 0 ? (
            <p className={styles.note}>Никого не нашли.</p>
          ) : (
            <ul className={styles.list}>
              {users.map((user) => (
                <li key={user.id} className={styles.user}>
                  <UserAvatar userId={user.id} username={user.username} size={40} />
                  <div className={styles.info}>
                    <span className={styles.name}>
                      {getFullName(user)}
                      {user.role === 'moderator' && (
                        <span className={styles.badge}>модератор</span>
                      )}
                      {user.isBanned && (
                        <span className={`${styles.badge} ${styles.banned}`}>заблокирован</span>
                      )}
                    </span>
                    <span className={styles.login}>@{user.username}</span>
                  </div>
                  {user.role !== 'moderator' && user.id !== viewer?.id && (
                    <BanToggleButton user={user} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
