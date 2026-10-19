import { useState } from 'react';

import { getFullName, UserAvatar, useUserSearch } from '@/entities/user';
import { useViewer } from '@/entities/viewer';
import { getErrorMessage } from '@/shared/api';
import { useDebouncedValue } from '@/shared/lib';
import { Button, Modal, Spinner, TextField } from '@/shared/ui';

import { useStartDirectChat } from '../model/useStartDirectChat';
import styles from './NewDirectChatDialog.module.css';

interface NewDirectChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NewDirectChatDialog({ open, onClose }: NewDirectChatDialogProps) {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query);
  const viewer = useViewer();
  const search = useUserSearch(debounced);
  const start = useStartDirectChat(() => {
    setQuery('');
    onClose();
  });

  const users = (search.data ?? []).filter((u) => u.id !== viewer?.id);

  return (
    <Modal open={open} title="Новый диалог" onClose={onClose}>
      <TextField
        aria-label="Имя пользователя"
        placeholder="Начните вводить имя или @username"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div className={styles.results}>
        {!debounced.trim() ? (
          <p className={styles.note}>Найдите собеседника по имени или username.</p>
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
                <UserAvatar userId={user.id} username={user.username} size={34} />
                <span className={styles.info}>
                  <span className={styles.name}>{getFullName(user)}</span>
                  <span className={styles.login}>@{user.username}</span>
                </span>
                <Button
                  size="sm"
                  loading={start.isPending && start.variables === user.id}
                  disabled={start.isPending || user.isBanned}
                  onClick={() => start.mutate(user.id)}
                  title={user.isBanned ? 'Пользователь заблокирован' : undefined}
                >
                  Написать
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
