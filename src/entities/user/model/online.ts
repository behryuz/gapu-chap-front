import { useMemo } from 'react';
import { create } from 'zustand';

export interface OnlineUser {
  id: number;
  username: string;
}

interface OnlineState {
  users: Record<number, string>;
  setAll: (users: OnlineUser[]) => void;
  setPresence: (user: OnlineUser, online: boolean) => void;
  clear: () => void;
}

/**
 * Онлайн-статус — состояние реального времени, а не серверный кеш:
 * начальный снимок приходит из GET /api/users/online, дальше его меняют события presence.
 */
export const useOnlineStore = create<OnlineState>()((set) => ({
  users: {},
  setAll: (users) => set({ users: Object.fromEntries(users.map((u) => [u.id, u.username])) }),
  setPresence: (user, online) =>
    set((state) => {
      if (online) {
        return { users: { ...state.users, [user.id]: user.username } };
      }
      const users = { ...state.users };
      delete users[user.id];
      return { users };
    }),
  clear: () => set({ users: {} }),
}));

export function useIsOnline(userId: number): boolean {
  return useOnlineStore((state) => userId in state.users);
}

export function useOnlineUsers(): OnlineUser[] {
  // Селектор возвращает стабильную ссылку из стора, а список строим в useMemo.
  // Если строить массив новых объектов прямо в селекторе, каждый вызов даёт «новое»
  // значение — React считает, что стор изменился, и рендер уходит в бесконечный цикл.
  const users = useOnlineStore((state) => state.users);
  return useMemo(
    () =>
      Object.entries(users)
        .map(([id, username]) => ({ id: Number(id), username }))
        .sort((a, b) => a.username.localeCompare(b.username)),
    [users],
  );
}

export const onlineActions = {
  setAll: (users: OnlineUser[]) => useOnlineStore.getState().setAll(users),
  setPresence: (user: OnlineUser, online: boolean) =>
    useOnlineStore.getState().setPresence(user, online),
  clear: () => useOnlineStore.getState().clear(),
};
