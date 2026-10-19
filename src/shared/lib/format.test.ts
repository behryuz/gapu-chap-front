import { describe, expect, it } from 'vitest';

import { formatCount, formatDay, pluralize } from './format';

describe('pluralize', () => {
  const forms = ['участник', 'участника', 'участников'] as const;

  it.each([
    [1, 'участник'],
    [2, 'участника'],
    [4, 'участника'],
    [5, 'участников'],
    [11, 'участников'],
    [12, 'участников'],
    [21, 'участник'],
    [22, 'участника'],
    [111, 'участников'],
  ])('%i → %s', (count, expected) => {
    expect(pluralize(count, forms)).toBe(expected);
  });
});

describe('formatDay', () => {
  const now = new Date(2026, 9, 16, 12, 0);

  it('сегодня и вчера', () => {
    expect(formatDay(new Date(2026, 9, 16, 1, 0), now)).toBe('Сегодня');
    expect(formatDay(new Date(2026, 9, 15, 23, 59), now)).toBe('Вчера');
  });

  it('прошлый год показывает год', () => {
    expect(formatDay(new Date(2025, 0, 2), now)).toMatch(/2025/);
  });
});

describe('formatCount', () => {
  it('обрезает большие числа', () => {
    expect(formatCount(7)).toBe('7');
    expect(formatCount(100)).toBe('99+');
  });
});
