import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { session } from '@/entities/viewer';
import { getErrorMessage } from '@/shared/api';
import { Button, TextField } from '@/shared/ui';

import { login } from '../api/login';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => login(username.trim(), password),
    onSuccess: (token) => {
      session.setToken(token);
      onSuccess();
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!mutation.isPending) {
      mutation.mutate();
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Имя пользователя"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoFocus
      />
      <TextField
        label="Пароль"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {mutation.isError && (
        <p className={styles.error} role="alert">
          {getErrorMessage(mutation.error)}
        </p>
      )}
      <Button
        type="submit"
        block
        loading={mutation.isPending}
        disabled={!username.trim() || !password}
      >
        Войти
      </Button>
    </form>
  );
}
