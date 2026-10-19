import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { Button } from '../button/Button';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Модальное окно на нативном <dialog>: браузер сам даёт фокус-ловушку,
 * закрытие по Esc и затемнение фона (::backdrop).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        if (!loading) {
          onCancel();
        }
      }}
      onClick={(event) => {
        // Клик по затемнению (вне содержимого) закрывает окно.
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        {description && <div className={styles.description}>{description}</div>}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Отмена
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
