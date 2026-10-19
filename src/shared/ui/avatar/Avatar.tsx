import { cn } from '@/shared/lib';

import styles from './Avatar.module.css';

interface AvatarProps {
  /** От seed зависит цвет — один и тот же пользователь всегда одного цвета. */
  seed: number | string;
  label: string;
  size?: number;
  online?: boolean;
  square?: boolean;
  className?: string;
}

const PALETTE_SIZE = 8;

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function initials(label: string): string {
  const words = label.trim().split(/[\s_]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0]![0]! + words[1]![0]! : label.slice(0, 2);
  return letters.toUpperCase();
}

export function Avatar({ seed, label, size = 36, online, square = false, className }: AvatarProps) {
  const tone = hash(String(seed)) % PALETTE_SIZE;

  return (
    <span
      className={cn(styles.avatar, square && styles.square, className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      data-tone={tone}
      aria-hidden="true"
    >
      {initials(label)}
      {online !== undefined && (
        <span className={cn(styles.status, online && styles.online)} />
      )}
    </span>
  );
}
