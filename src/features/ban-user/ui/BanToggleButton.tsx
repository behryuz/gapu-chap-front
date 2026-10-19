import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { moderationApi, userKeys } from '@/entities/user';
import type { User } from '@/entities/user';
import { getErrorMessage } from '@/shared/api';
import { Button, ConfirmDialog, toast } from '@/shared/ui';

export function BanToggleButton({ user }: { user: User }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => (user.isBanned ? moderationApi.unban(user.id) : moderationApi.ban(user.id)),
    onSuccess: async () => {
      setConfirmOpen(false);
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success(
        user.isBanned ? `@${user.username} разблокирован` : `@${user.username} заблокирован`,
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (user.isBanned) {
    return (
      <Button
        variant="secondary"
        size="sm"
        loading={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        Разблокировать
      </Button>
    );
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
        Заблокировать
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title={`Заблокировать @${user.username}?`}
        description="Пользователь сразу потеряет доступ: его отключит от чата, а войти снова он не сможет, пока вы не снимете блокировку. Сообщения останутся в истории."
        confirmLabel="Заблокировать"
        danger
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
