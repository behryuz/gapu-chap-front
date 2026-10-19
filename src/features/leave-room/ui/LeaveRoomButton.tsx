import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { forgetRoom, roomApi } from '@/entities/room';
import { getErrorMessage } from '@/shared/api';
import { routes } from '@/shared/config';
import { Button, ConfirmDialog, Icon, toast } from '@/shared/ui';

interface LeaveRoomButtonProps {
  roomId: number;
  roomName: string;
}

export function LeaveRoomButton({ roomId, roomName }: LeaveRoomButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => roomApi.leave(roomId),
    onSuccess: () => {
      setConfirmOpen(false);
      forgetRoom(queryClient, roomId);
      void navigate(routes.home, { replace: true });
      toast.info(`Вы вышли из комнаты «${roomName}»`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon={<Icon name="leave" size={18} />}
        onClick={() => setConfirmOpen(true)}
        aria-label="Выйти из комнаты"
        title="Выйти из комнаты"
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Выйти из комнаты?"
        description={`Вы перестанете получать сообщения из «${roomName}». Вернуться можно в любой момент.`}
        confirmLabel="Выйти"
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
