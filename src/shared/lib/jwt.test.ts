import { describe, expect, it } from 'vitest';

import { decodeJwtPayload } from './jwt';

function makeToken(payload: object): string {
  const json = new TextEncoder().encode(JSON.stringify(payload));
  const base64 = btoa(String.fromCharCode(...json))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${base64}.signature`;
}

describe('decodeJwtPayload', () => {
  it('читает claims, включая не-ASCII', () => {
    const token = makeToken({ uid: 7, username: 'алиса', exp: 123 });
    expect(decodeJwtPayload(token)).toEqual({ uid: 7, username: 'алиса', exp: 123 });
  });

  it('возвращает null для мусора', () => {
    expect(decodeJwtPayload('not-a-token')).toBeNull();
    expect(decodeJwtPayload('a.%%%.b')).toBeNull();
  });
});
