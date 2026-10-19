import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { decodeJwtPayload } from '@/shared/lib';

export interface Viewer {
  id: number;
  username: string;
  /** Момент истечения токена, мс с эпохи. */
  expiresAt: number;
}

interface SessionState {
  token: string | null;
  setToken: (token: string) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clear: () => set({ token: null }),
    }),
    {
      name: 'gapu-chap.session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    },
  ),
);

/** Достаёт пользователя из claims токена (uid, username, exp — как их кладёт бэкенд). */
export function parseViewer(token: string | null): Viewer | null {
  if (!token) {
    return null;
  }
  const claims = decodeJwtPayload(token);
  if (
    !claims ||
    typeof claims.uid !== 'number' ||
    typeof claims.username !== 'string' ||
    typeof claims.exp !== 'number'
  ) {
    return null;
  }
  return { id: claims.uid, username: claims.username, expiresAt: claims.exp * 1000 };
}

export function isSessionExpired(viewer: Viewer | null, now = Date.now()): boolean {
  return !viewer || viewer.expiresAt <= now;
}

export function useViewer(): Viewer | null {
  const token = useSessionStore((state) => state.token);
  return useMemo(() => parseViewer(token), [token]);
}

/** Для кода вне React (HTTP-клиент, обработчики WebSocket). */
export const session = {
  getToken: () => useSessionStore.getState().token,
  getViewer: () => parseViewer(useSessionStore.getState().token),
  setToken: (token: string) => useSessionStore.getState().setToken(token),
  clear: () => useSessionStore.getState().clear(),
};
