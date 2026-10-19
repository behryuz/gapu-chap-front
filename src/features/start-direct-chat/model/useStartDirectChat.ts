import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { roomApi, roomKeys } from '@/entities/room';
import { getErrorMessage } from '@/shared/api';
import { routes } from '@/shared/config';
import { toast } from '@/shared/ui';

/** Открыть личный диалог: сервер вернёт существующий или создаст новый — дублей не будет. */
export function useStartDirectChat(onDone?: () => void) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (userId: number) => roomApi.openDirect(userId),
    onSuccess: async (room) => {
      // Ждём свежий список: страница диалога берёт собеседника оттуда.
      await queryClient.invalidateQueries({ queryKey: roomKeys.mine() });
      onDone?.();
      void navigate(routes.room(room.id));
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
