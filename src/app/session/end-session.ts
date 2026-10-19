import { onlineActions } from '@/entities/user';
import { session } from '@/entities/viewer';
import type { SessionEndReason } from '@/shared/api';
import { toast } from '@/shared/ui';

import { queryClient } from '../providers/query-client';

/**
 * Единая точка выхода по инициативе сервера: истёк токен (401), аккаунт заблокирован
 * (403 «user is banned» или закрытие WebSocket с кодом 4003). Чистим всё, что относится
 * к пользователю, — guard сам отправит на страницу входа.
 */
export function endSession(reason: SessionEndReason): void {
  if (!session.getToken()) {
    return; // уже вышли (например, одновременно пришли 401 и закрытие сокета)
  }
  session.clear();
  queryClient.clear();
  onlineActions.clear();

  if (reason === 'banned') {
    toast.error('Ваш аккаунт заблокирован модератором.');
  } else {
    toast.info('Сессия истекла — войдите снова.');
  }
}
