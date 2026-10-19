import { formatCount } from '@/shared/lib';

import styles from './Badge.module.css';

interface BadgeProps {
  count: number;
  label?: string;
}

export function Badge({ count, label }: BadgeProps) {
  if (count <= 0) {
    return null;
  }
  return (
    <span className={styles.badge} aria-label={label ?? String(count)}>
      {formatCount(count)}
    </span>
  );
}
