export interface TextPart {
  text: string;
  match: boolean;
}

const WORD_RE = /[\p{L}\p{N}]+/gu;

/** Слова запроса так же, как их выделяет бэкенд: только буквы и цифры. */
export function searchTerms(query: string): string[] {
  return query.toLowerCase().match(WORD_RE)?.slice(0, 8) ?? [];
}

/**
 * Делит текст на части и помечает совпадения с началом слов запроса —
 * так же ищет сервер («прив» находит «Привет»). Возвращает данные, а не HTML:
 * рендерим через React, поэтому XSS через текст сообщения невозможен.
 */
export function highlight(text: string, terms: string[]): TextPart[] {
  if (terms.length === 0) {
    return [{ text, match: false }];
  }
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // Совпадение — только в начале слова: перед ним не буква и не цифра.
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(${escaped.join('|')})`, 'giu');

  const parts: TextPart[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const start = m.index;
    if (start > last) {
      parts.push({ text: text.slice(last, start), match: false });
    }
    parts.push({ text: m[0], match: true });
    last = start + m[0].length;
  }
  if (last < text.length) {
    parts.push({ text: text.slice(last), match: false });
  }
  return parts;
}
