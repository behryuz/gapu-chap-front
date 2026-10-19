import { describe, expect, it } from 'vitest';

import type { UserRoom } from '../model/types';
import { getRoomTitle } from './title';

const base: UserRoom = {
  id: 1,
  name: 'general',
  ownerId: 1,
  kind: 'public',
  createdAt: '',
  lastReadMessageId: 0,
  unreadCount: 0,
  peer: null,
};

describe('getRoomTitle', () => {
  it('публичная комната — по названию, диалог — по собеседнику', () => {
    expect(getRoomTitle(base)).toBe('general');
    expect(
      getRoomTitle({ ...base, kind: 'direct', name: 'dm:1:2', peer: { id: 2, username: 'bob' } }),
    ).toBe('bob');
  });
});
