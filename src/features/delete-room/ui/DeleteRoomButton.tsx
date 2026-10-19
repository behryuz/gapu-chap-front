import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { messageKeys } from '@/entities/message';
import { forgetRoom, roomApi, roomKeys } from '@/entities/room';
import { getErrorMessage } from '@/shared/api';
import { routes } from '@/shared/config';
import { Button, ConfirmDialog, Icon, toast } from '@/shared/ui';

interface DeleteRoomButtonProps {
  roomId: number;
  roomName: string;
}

export function DeleteRoomButton({ roomId, roomName }: DeleteRoomButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => roomApi.remove(roomId),
    onSuccess: () => {
      setConfirmOpen(false);
      forgetRoom(queryClient, roomId);
      queryClient.removeQueries({ queryKey: roomKeys.detail(roomId) });
      queryClient.removeQueries({ queryKey: messageKeys.room(roomId) });
      void navigate(routes.home, { replace: true });
      toast.success(`Комната «${roomName}» удалена`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon={<Icon name="trash" size={18} />}
        onClick={() => setConfirmOpen(true)}
        aria-label="Удалить комнату"
        title="Удалить комнату"
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Удалить комнату?"
        description={`Комната «${roomName}» и вся её история будут удалены для всех участников. Это действие нельзя отменить.`}
        confirmLabel="Удалить"
        danger
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
