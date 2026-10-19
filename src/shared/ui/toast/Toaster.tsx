import { cn } from '@/shared/lib';

import { Icon } from '../icon/Icon';
import styles from './Toaster.module.css';
import { useToastStore } from './toast-store';

export function Toaster() {
  const items = useToastStore((state) => state.items);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className={styles.region} role="region" aria-label="Уведомления" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={cn(styles.toast, styles[item.kind])} role="status">
          <span className={styles.message}>{item.message}</span>
          <button
            type="button"
            className={styles.close}
            onClick={() => dismiss(item.id)}
            aria-label="Закрыть уведомление"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
