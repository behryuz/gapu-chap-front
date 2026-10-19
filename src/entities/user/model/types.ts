export type UserRole = 'user' | 'moderator';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isBanned: boolean;
}

export function getFullName(user: Pick<User, 'firstName' | 'lastName' | 'username'>): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;
}
