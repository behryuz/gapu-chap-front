import { describe, expect, it } from 'vitest';

import { highlight, searchTerms } from './highlight';

describe('searchTerms', () => {
  it('берёт только буквы и цифры, как сервер', () => {
    expect(searchTerms('  Привет, МИР! a&b ')).toEqual(['привет', 'мир', 'a', 'b']);
    expect(searchTerms('!!!')).toEqual([]);
  });
});

describe('highlight', () => {
  it('подсвечивает начало слов без учёта регистра', () => {
    const parts = highlight('Привет, приветствую! Сопривет', ['прив']);
    expect(parts.filter((p) => p.match).map((p) => p.text)).toEqual(['Прив', 'прив']);
    expect(parts.map((p) => p.text).join('')).toBe('Привет, приветствую! Сопривет');
  });

  it('спецсимволы регулярных выражений не ломают поиск', () => {
    expect(highlight('a.b (c)', ['c']).filter((p) => p.match)).toHaveLength(1);
  });
});
