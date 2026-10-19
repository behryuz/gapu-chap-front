import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { http } from '@/shared/api';

import type { User, UserRole } from '../model/types';

interface UserDto {
  id: number;
  username: string;
  first_name: string;
  last_name?: string;
  role: UserRole;
  is_banned: boolean;
}

const mapUser = (dto: UserDto): User => ({
  id: dto.id,
  username: dto.username,
  firstName: dto.first_name,
  lastName: dto.last_name ?? '',
  role: dto.role,
  isBanned: dto.is_banned,
});

export const userKeys = {
  all: ['users'] as const,
  search: (query: string) => [...userKeys.all, 'search', query] as const,
};

export async function searchUsers(query: string, signal?: AbortSignal): Promise<User[]> {
  const params = new URLSearchParams({ q: query });
  const data = await http.get<{ users: UserDto[] }>(`/api/users?${params}`, { signal });
  return data.users.map(mapUser);
}

/** Поиск по началу имени. Пустой запрос не отправляем; пока печатают — показываем прошлый результат. */
export function useUserSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: userKeys.search(q),
    queryFn: ({ signal }) => searchUsers(q, signal),
    enabled: q.length > 0,
    placeholderData: keepPreviousData,
  });
}

export const moderationApi = {
  ban: (userId: number) => http.post<void>(`/api/moderation/users/${userId}/ban`),
  unban: (userId: number) => http.post<void>(`/api/moderation/users/${userId}/unban`),
};
