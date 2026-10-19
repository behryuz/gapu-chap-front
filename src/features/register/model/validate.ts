import { limits } from '@/shared/config';

export interface RegisterValues {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  passwordRepeat: string;
}

export type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

/** Те же правила, что на сервере, плюс совпадение паролей (это проверка только для UI). */
export function validateRegister(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};
  const firstName = values.firstName.trim();

  if (!firstName) {
    errors.firstName = 'Укажите имя';
  } else if ([...firstName].length > limits.nameMaxLength) {
    errors.firstName = `Не длиннее ${limits.nameMaxLength} символов`;
  }
  if ([...values.lastName.trim()].length > limits.nameMaxLength) {
    errors.lastName = `Не длиннее ${limits.nameMaxLength} символов`;
  }
  if (!limits.usernamePattern.test(values.username.trim())) {
    errors.username = 'От 3 до 32 символов: латинские буквы, цифры и _';
  }
  if ([...values.password].length < limits.passwordMinLength) {
    errors.password = `Минимум ${limits.passwordMinLength} символов`;
  } else if (new TextEncoder().encode(values.password).length > limits.passwordMaxBytes) {
    errors.password = 'Слишком длинный пароль';
  }
  if (values.passwordRepeat !== values.password) {
    errors.passwordRepeat = 'Пароли не совпадают';
  }
  return errors;
}
