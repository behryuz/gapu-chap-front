import { http } from '@/shared/api';

export async function login(username: string, password: string): Promise<string> {
  // auth: false — неверный пароль даёт 401, но это не «сессия истекла», разлогинивать нечего.
  const data = await http.post<{ token: string }>(
    '/api/auth/login',
    { username, password },
    { auth: false },
  );
  return data.token;
}
