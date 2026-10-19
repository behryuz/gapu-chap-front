import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

import { routes } from '@/shared/config';
import { cn } from '@/shared/lib';
import { Avatar, Badge } from '@/shared/ui';

import styles from './RoomListItem.module.css';

interface RoomListItemProps {
  roomId: number;
  name: string;
  subtitle?: string;
  unreadCount?: number;
  /** Не ссылка, а просто строка (например, в каталоге комнат, где действие — «Войти»). */
  asLink?: boolean;
  trailing?: ReactNode;
  /** Свой аватар вместо стандартного квадратного (например, аватар собеседника в диалоге). */
  avatar?: ReactNode;
}

export function RoomListItem({
  roomId,
  name,
  subtitle,
  unreadCount = 0,
  asLink = true,
  trailing,
  avatar,
}: RoomListItemProps) {
  const body = (
    <>
      {avatar ?? <Avatar seed={`room-${roomId}`} label={name} size={36} square />}
      <span className={styles.text}>
        <span className={cn(styles.name, unreadCount > 0 && styles.unread)}>{name}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      <Badge count={unreadCount} label={`${unreadCount} непрочитанных`} />
      {trailing}
    </>
  );

  if (!asLink) {
    return <div className={styles.item}>{body}</div>;
  }

  return (
    <NavLink
      to={routes.room(roomId)}
      className={({ isActive }) => cn(styles.item, styles.link, isActive && styles.active)}
    >
      {body}
    </NavLink>
  );
}
