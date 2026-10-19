import { useQueryClient } from '@tanstack/react-query';

import { onlineActions } from '@/entities/user';
import { session } from '@/entities/viewer';
import { Button, Icon } from '@/shared/ui';

export function LogoutButton() {
  const queryClient = useQueryClient();

  const handleLogout = () => {
    session.clear();
    // Данные прошлого пользователя не должны достаться следующему.
    queryClient.clear();
    onlineActions.clear();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={<Icon name="logout" size={18} />}
      onClick={handleLogout}
      aria-label="Выйти из аккаунта"
      title="Выйти"
    />
  );
}
