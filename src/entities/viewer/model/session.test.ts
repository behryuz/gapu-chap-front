import { describe, expect, it } from 'vitest';

import { isSessionExpired, parseViewer } from './session';

function token(payload: object): string {
  const body = btoa(JSON.stringify(payload)).replace(/=+$/, '');
  return `h.${body}.s`;
}

describe('parseViewer', () => {
  it('берёт uid, username и exp из claims', () => {
    expect(parseViewer(token({ uid: 3, username: 'bob', exp: 100 }))).toEqual({
      id: 3,
      username: 'bob',
      expiresAt: 100_000,
    });
  });

  it('отклоняет токен без нужных полей', () => {
    expect(parseViewer(token({ sub: '3' }))).toBeNull();
    expect(parseViewer(null)).toBeNull();
  });
});

describe('isSessionExpired', () => {
  it('сравнивает exp с текущим временем', () => {
    const viewer = { id: 1, username: 'a', expiresAt: 1_000 };
    expect(isSessionExpired(viewer, 999)).toBe(false);
    expect(isSessionExpired(viewer, 1_000)).toBe(true);
    expect(isSessionExpired(null)).toBe(true);
  });
});
