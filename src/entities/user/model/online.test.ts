import { beforeEach, describe, expect, it } from 'vitest';

import { onlineActions, useOnlineStore } from './online';

describe('online store', () => {
  beforeEach(() => onlineActions.clear());

  it('применяет снимок и события presence', () => {
    onlineActions.setAll([
      { id: 1, username: 'alice' },
      { id: 2, username: 'bob' },
    ]);
    onlineActions.setPresence({ id: 3, username: 'carol' }, true);
    onlineActions.setPresence({ id: 1, username: 'alice' }, false);

    expect(useOnlineStore.getState().users).toEqual({ 2: 'bob', 3: 'carol' });
  });
});
