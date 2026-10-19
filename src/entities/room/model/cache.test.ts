import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { roomKeys } from '../api/queries';
import { applyMemberRead, applyOwnRead, forgetRoom, incrementUnread } from './cache';
import type { Member, UserRoom } from './types';

const room = (id: number, lastRead = 0, unread = 0): UserRoom => ({
  id,
  name: `room-${id}`,
  ownerId: 1,
  kind: 'public',
  createdAt: '2026-10-16T00:00:00Z',
  lastReadMessageId: lastRead,
  unreadCount: unread,
  peer: null,
});

describe('room cache', () => {
  it('считает непрочитанные и сбрасывает их при прочтении', () => {
    const qc = new QueryClient();
    qc.setQueryData(roomKeys.mine(), [room(1), room(2)]);

    incrementUnread(qc, 1);
    incrementUnread(qc, 1);
    expect(qc.getQueryData<UserRoom[]>(roomKeys.mine())?.[0]?.unreadCount).toBe(2);

    applyOwnRead(qc, 1, 10);
    expect(qc.getQueryData<UserRoom[]>(roomKeys.mine())?.[0]).toMatchObject({
      lastReadMessageId: 10,
      unreadCount: 0,
    });
  });

  it('отметка участника не двигается назад', () => {
    const qc = new QueryClient();
    const member: Member = {
      userId: 2,
      username: 'bob',
      firstName: 'Bob',
      lastName: '',
      joinedAt: '',
      lastReadMessageId: 5,
    };
    qc.setQueryData(roomKeys.members(1), [member]);

    applyMemberRead(qc, 1, 2, 3);
    expect(qc.getQueryData<Member[]>(roomKeys.members(1))?.[0]?.lastReadMessageId).toBe(5);

    applyMemberRead(qc, 1, 2, 8);
    expect(qc.getQueryData<Member[]>(roomKeys.members(1))?.[0]?.lastReadMessageId).toBe(8);
  });

  it('забывает покинутую комнату', () => {
    const qc = new QueryClient();
    qc.setQueryData(roomKeys.mine(), [room(1), room(2)]);

    forgetRoom(qc, 1);
    expect(qc.getQueryData<UserRoom[]>(roomKeys.mine())?.map((r) => r.id)).toEqual([2]);
  });
});
