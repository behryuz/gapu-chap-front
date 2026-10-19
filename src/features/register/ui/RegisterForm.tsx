import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { session } from '@/entities/viewer';
import { getErrorMessage } from '@/shared/api';
import { Button, TextField } from '@/shared/ui';

import { register } from '../api/register';
import { validateRegister } from '../model/validate';
import type { RegisterErrors, RegisterValues } from '../model/validate';
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
  onSuccess: () => void;
}

const initialValues: RegisterValues = {
  firstName: '',
  lastName: '',
  username: '',
  password: '',
  passwordRepeat: '',
};

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () => register(values),
    onSuccess: (token) => {
      session.setToken(token);
      onSuccess();
    },
  });

  const update = (field: keyof RegisterValues) => (event: { target: { value: string } }) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    // До первой попытки отправки не ругаемся на каждую букву.
    if (submitted) {
      setErrors(validateRegister(next));
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0 && !mutation.isPending) {
      mutation.mutate();
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <TextField
          label="Имя"
          name="firstName"
          autoComplete="given-name"
          value={values.firstName}
          onChange={update('firstName')}
          error={errors.firstName}
          autoFocus
        />
        <TextField
          label="Фамилия"
          name="lastName"
          autoComplete="family-name"
          value={values.lastName}
          onChange={update('lastName')}
          error={errors.lastName}
          hint="Необязательно"
        />
      </div>
      <TextField
        label="Имя пользователя"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        value={values.username}
        onChange={update('username')}
        error={errors.username}
        hint="Латиница, цифры и _ — так вас увидят в чате"
      />
      <TextField
        label="Пароль"
        name="password"
        type="password"
        autoComplete="new-password"
        value={values.password}
        onChange={update('password')}
        error={errors.password}
      />
      <TextField
        label="Повторите пароль"
        name="passwordRepeat"
        type="password"
        autoComplete="new-password"
        value={values.passwordRepeat}
        onChange={update('passwordRepeat')}
        error={errors.passwordRepeat}
      />
      {mutation.isError && (
        <p className={styles.error} role="alert">
          {getErrorMessage(mutation.error)}
        </p>
      )}
      <Button type="submit" block loading={mutation.isPending}>
        Создать аккаунт
      </Button>
    </form>
  );
}
