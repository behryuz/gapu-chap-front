import { http } from '@/shared/api';

import type { OnlineUser } from '../model/online';

export async function fetchOnlineUsers(): Promise<OnlineUser[]> {
  const data = await http.get<{ users: OnlineUser[] }>('/api/users/online');
  return data.users;
}
