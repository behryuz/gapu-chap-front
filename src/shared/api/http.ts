import { env } from '@/shared/config';

/** Так бэкенд отвечает заблокированному пользователю (domain.ErrBanned). */
export const BANNED_MESSAGE = 'user is banned';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Почему сессия закончилась: истёк/отозван токен или аккаунт заблокирован модератором. */
export type SessionEndReason = 'expired' | 'banned';

interface AuthHooks {
  getToken: () => string | null;
  onUnauthorized: (reason: SessionEndReason) => void;
}

// shared не знает про сессию (она живёт в entities), поэтому слой app
// «вставляет» сюда доступ к токену при старте — инверсия зависимостей.
let authHooks: AuthHooks = {
  getToken: () => null,
  onUnauthorized: () => {},
};

export function configureHttp(hooks: AuthHooks): void {
  authHooks = hooks;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  /** false — не прикладывать токен и не разлогинивать на 401 (логин, регистрация). */
  auth?: boolean;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const token = auth ? authHooks.getToken() : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw new ApiError(0, 'network error');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : `HTTP ${response.status}`;
    if (auth && response.status === 401) {
      authHooks.onUnauthorized('expired');
    }
    if (auth && response.status === 403 && message === BANNED_MESSAGE) {
      authHooks.onUnauthorized('banned');
    }
    throw new ApiError(response.status, message);
  }

  return data as T;
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
