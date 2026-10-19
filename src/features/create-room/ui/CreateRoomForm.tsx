import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { roomApi, roomKeys } from '@/entities/room';
import { getErrorMessage } from '@/shared/api';
import { limits, routes } from '@/shared/config';
import { Button, Icon, TextField } from '@/shared/ui';

import styles from './CreateRoomForm.module.css';

export function CreateRoomForm({ onDone }: { onDone?: () => void }) {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (roomName: string) => roomApi.create(roomName),
    onSuccess: async (room) => {
      setName('');
      await queryClient.invalidateQueries({ queryKey: roomKeys.all });
      onDone?.();
      void navigate(routes.room(room.id));
    },
  });

  const trimmed = name.trim();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (trimmed && !mutation.isPending) {
      mutation.mutate(trimmed);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <TextField
        aria-label="Название новой комнаты"
        placeholder="Название новой комнаты"
        value={name}
        maxLength={limits.roomNameMaxLength}
        onChange={(e) => {
          setName(e.target.value);
          mutation.reset();
        }}
        error={mutation.isError ? getErrorMessage(mutation.error) : null}
        className={styles.input}
      />
      <Button
        type="submit"
        icon={<Icon name="plus" size={18} />}
        loading={mutation.isPending}
        disabled={!trimmed}
        aria-label="Создать комнату"
        title="Создать комнату"
      />
    </form>
  );
}
