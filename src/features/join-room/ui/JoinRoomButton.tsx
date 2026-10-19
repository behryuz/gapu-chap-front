import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { roomApi, roomKeys } from '@/entities/room';
import { getErrorMessage } from '@/shared/api';
import { routes } from '@/shared/config';
import { Button, toast } from '@/shared/ui';

interface JoinRoomButtonProps {
  roomId: number;
  size?: 'sm' | 'md';
  /** Открыть комнату после вступления (из каталога — да, со страницы комнаты — уже открыта). */
  openAfterJoin?: boolean;
}

export function JoinRoomButton({ roomId, size = 'sm', openAfterJoin = true }: JoinRoomButtonProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => roomApi.join(roomId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: roomKeys.mine() }),
        queryClient.invalidateQueries({ queryKey: roomKeys.members(roomId) }),
      ]);
      if (openAfterJoin) {
        void navigate(routes.room(roomId));
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <Button size={size} onClick={() => mutation.mutate()} loading={mutation.isPending}>
      Вступить
    </Button>
  );
}
