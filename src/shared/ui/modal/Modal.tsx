import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Модальное окно на нативном <dialog>: фокус-ловушка, Esc и затемнение — от браузера. */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal() фокусирует первый фокусируемый элемент — у нас это «Закрыть».
      // Переводим фокус в первое поле ввода, чтобы можно было сразу печатать.
      dialog.querySelector<HTMLElement>('input, textarea')?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon name="close" size={18} />}
            onClick={onClose}
            aria-label="Закрыть"
          />
        </header>
        {open && children}
      </div>
    </dialog>
  );
}
