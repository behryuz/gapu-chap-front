function defaultWsUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

export const env = {
  /** Префикс REST API. Пусто — тот же origin (в dev запросы проксирует Vite). */
  apiUrl: import.meta.env.VITE_API_URL ?? '',
  /** Вычисляется при обращении: при импорте модуля (например, в тестах) window может не быть. */
  get wsUrl(): string {
    return import.meta.env.VITE_WS_URL ?? defaultWsUrl();
  },
};

/** Те же ограничения, что проверяет бэкенд, — чтобы показать ошибку до запроса. */
export const limits = {
  usernamePattern: /^[a-zA-Z0-9_]{3,32}$/,
  nameMaxLength: 64,
  passwordMinLength: 8,
  passwordMaxBytes: 72,
  roomNameMaxLength: 64,
  messageMaxLength: 4000,
  historyPageSize: 50,
} as const;

export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  moderation: '/moderation',
  room: (id: number | string) => `/rooms/${id}`,
} as const;
