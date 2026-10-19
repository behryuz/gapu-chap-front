import { Avatar } from '@/shared/ui';

import { useIsOnline } from '../model/online';

interface UserAvatarProps {
  userId: number;
  username: string;
  size?: number;
  showStatus?: boolean;
}

export function UserAvatar({ userId, username, size, showStatus = true }: UserAvatarProps) {
  const online = useIsOnline(userId);
  return (
    <Avatar seed={userId} label={username} size={size} online={showStatus ? online : undefined} />
  );
}
