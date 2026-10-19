import { QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/shared/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Ошибки 4xx не лечатся повтором (нет прав, не найдено) — повторяем только сетевые и 5xx.
      retry: (failureCount, error) => {
        if (isApiError(error) && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
