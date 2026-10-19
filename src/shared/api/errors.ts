import { ApiError } from './http';

// Сервер отвечает по-английски и в техническом виде. Переводим известные
// ответы в понятный пользователю текст, остальное показываем как есть.
const knownMessages: Array<[RegExp, string]> = [
  [/^network error$/, 'Нет связи с сервером. Проверьте подключение.'],
  [/invalid credentials/i, 'Неверное имя пользователя или пароль.'],
  [/username already taken/i, 'Это имя пользователя уже занято.'],
  [/room name already taken/i, 'Комната с таким названием уже существует.'],
  [/not a member/i, 'Вы не участник этой комнаты.'],
  [/only owner can delete/i, 'Удалить комнату может только её создатель.'],
  [/owner cannot leave/i, 'Создатель не может выйти из комнаты — её можно только удалить.'],
  [/message must be/i, 'Сообщение должно быть от 1 до 4000 символов.'],
  [/^not found$/i, 'Не найдено.'],
  [/user is banned/i, 'Аккаунт заблокирован модератором.'],
  [/conversation with yourself/i, 'Нельзя начать диалог с самим собой.'],
  [/cannot leave a direct conversation/i, 'Из личного диалога нельзя выйти — его можно только удалить.'],
  [/moderators cannot be banned/i, 'Модератора заблокировать нельзя.'],
  [/only moderators/i, 'Это действие доступно только модераторам.'],
  [/cannot moderate yourself/i, 'Нельзя заблокировать самого себя.'],
  [/search query must contain/i, 'Введите хотя бы одно слово для поиска.'],
  [/search query must be/i, 'Слишком длинный поисковый запрос.'],
  [/too many/i, 'Слишком много запросов, попробуйте позже.'],
];

export function getErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === 'string' ? error : '';

  for (const [pattern, text] of knownMessages) {
    if (pattern.test(raw)) {
      return text;
    }
  }
  if (error instanceof ApiError && error.status >= 500) {
    return 'Ошибка сервера. Попробуйте ещё раз.';
  }
  return raw.replace(/^validation failed:\s*/i, '') || 'Что-то пошло не так.';
}

export function isApiError(error: unknown, status?: number): error is ApiError {
  return error instanceof ApiError && (status === undefined || error.status === status);
}
