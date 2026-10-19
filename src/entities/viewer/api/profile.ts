import { useQuery } from '@tanstack/react-query';

import { http } from '@/shared/api';

export interface ViewerProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'moderator';
}

interface UserDto {
  id: number;
  username: string;
  first_name: string;
  last_name?: string;
  role: 'user' | 'moderator';
}

export const viewerKeys = {
  profile: ['viewer', 'profile'] as const,
};

export function useViewerProfile() {
  return useQuery({
    queryKey: viewerKeys.profile,
    queryFn: async ({ signal }): Promise<ViewerProfile> => {
      const dto = await http.get<UserDto>('/api/me', { signal });
      return {
        id: dto.id,
        username: dto.username,
        firstName: dto.first_name,
        lastName: dto.last_name ?? '',
        role: dto.role,
      };
    },
    staleTime: 5 * 60_000,
  });
}

/** Модератор ли текущий пользователь. Роль приходит с сервера (из базы), не из токена. */
export function useIsModerator(): boolean {
  const profile = useViewerProfile();
  return profile.data?.role === 'moderator';
}
