import { http } from '@/shared/api';

import type { RegisterValues } from '../model/validate';

export async function register(values: RegisterValues): Promise<string> {
  await http.post(
    '/api/auth/register',
    {
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      username: values.username.trim(),
      password: values.password,
    },
    { auth: false },
  );
  // Регистрация не выдаёт токен — сразу входим теми же данными.
  const data = await http.post<{ token: string }>(
    '/api/auth/login',
    { username: values.username.trim(), password: values.password },
    { auth: false },
  );
  return data.token;
}
