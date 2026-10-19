import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';

import { addMessageToCache, messageApi } from '@/entities/message';
import { getErrorMessage } from '@/shared/api';
import { limits } from '@/shared/config';
import { cn } from '@/shared/lib';
import { Button, Icon, toast } from '@/shared/ui';

import styles from './MessageComposer.module.css';

const MAX_TEXTAREA_HEIGHT = 160;
const COUNTER_THRESHOLD = limits.messageMaxLength - 500;

/**
 * Отправка — через REST, а не через WebSocket: у HTTP есть ответ на конкретный запрос
 * (201 с сообщением или ошибка), поэтому можно честно показать «отправляется»,
 * вернуть текст при ошибке и не гадать, к какому запросу относится событие error.
 * Остальные участники всё равно получат сообщение мгновенно — сервер разошлёт его по WebSocket.
 */
export function MessageComposer({ roomId }: { roomId: number }) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (body: string) => messageApi.send(roomId, body),
    onSuccess: (message) => addMessageToCache(queryClient, message),
    onError: (error, body) => {
      // Не теряем набранный текст: возвращаем его в поле, если пользователь не начал новый.
      setText((current) => current || body);
      toast.error(getErrorMessage(error));
    },
  });

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [text]);

  const body = text.trim();
  const length = [...text].length;
  const tooLong = length > limits.messageMaxLength;

  const submit = () => {
    if (!body || tooLong) {
      return;
    }
    mutation.mutate(body);
    setText('');
    textareaRef.current?.focus();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter — отправить, Shift+Enter — новая строка. Во время набора через IME
    // (например, японская раскладка) Enter подтверждает ввод, а не отправляет.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          rows={1}
          placeholder="Написать сообщение…"
          aria-label="Текст сообщения"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {length > COUNTER_THRESHOLD && (
          <span className={cn(styles.counter, tooLong && styles.counterError)}>
            {length}/{limits.messageMaxLength}
          </span>
        )}
      </div>
      <Button
        type="submit"
        icon={<Icon name="send" size={18} />}
        disabled={!body || tooLong}
        aria-label="Отправить"
        title="Отправить (Enter)"
      />
    </form>
  );
}
