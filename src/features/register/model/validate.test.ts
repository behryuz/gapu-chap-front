import { describe, expect, it } from 'vitest';

import { validateRegister } from './validate';

const valid = {
  firstName: 'Алиса',
  lastName: '',
  username: 'alice_01',
  password: 'secret123',
  passwordRepeat: 'secret123',
};

describe('validateRegister', () => {
  it('пропускает корректные данные', () => {
    expect(validateRegister(valid)).toEqual({});
  });

  it('ловит ошибки по каждому полю', () => {
    const errors = validateRegister({
      firstName: '   ',
      lastName: '',
      username: 'al',
      password: 'short',
      passwordRepeat: 'other',
    });
    expect(Object.keys(errors).sort()).toEqual(
      ['firstName', 'password', 'passwordRepeat', 'username'].sort(),
    );
  });

  it('запрещает кириллицу в username, как сервер', () => {
    expect(validateRegister({ ...valid, username: 'алиса' }).username).toBeDefined();
  });

  it('считает пароль в байтах (bcrypt ограничен 72 байтами)', () => {
    const password = 'я'.repeat(40); // 40 символов, но 80 байт
    expect(validateRegister({ ...valid, password, passwordRepeat: password }).password).toBe(
      'Слишком длинный пароль',
    );
  });
});
