/** Half-open range of UTF-16 offsets into a string: `text.slice(start, end)`. */
export interface TextSpan {
  start: number;
  end: number;
}

/** Splits text into the units of one level (words, sentences, ...), in order. */
export type Level = (text: string) => TextSpan[];

/** Shrinks a span so it doesn't start or end with whitespace. Returns null if nothing is left. */
function trimSpan(text: string, start: number, end: number): TextSpan | null {
  while (start < end && /\s/.test(text[start]!)) start++;
  while (end > start && /\s/.test(text[end - 1]!)) end--;
  return start < end ? { start, end } : null;
}

export const words: Level = (text) => {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
  const spans: TextSpan[] = [];
  for (const { segment, index, isWordLike } of segmenter.segment(text)) {
    if (isWordLike) spans.push({ start: index, end: index + segment.length });
  }
  return spans;
};

export const sentences: Level = (text) => {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'sentence' });
  const spans: TextSpan[] = [];
  for (const { segment, index } of segmenter.segment(text)) {
    const span = trimSpan(text, index, index + segment.length);
    if (span) spans.push(span);
  }
  return spans;
};

export const paragraphs: Level = (text) => {
  const spans: TextSpan[] = [];
  for (const match of text.matchAll(/[^\n]+/g)) {
    const span = trimSpan(text, match.index, match.index + match[0].length);
    if (span) spans.push(span);
  }
  return spans;
};

export const whole: Level = (text) => {
  const span = trimSpan(text, 0, text.length);
  return span ? [span] : [];
};

/** Levels for `<input>` and `<textarea>` values, where paragraphs are lines. */
export const TEXT_FIELD_LEVELS: Level[] = [words, sentences, paragraphs, whole];

/** Levels within one DOM block element; the block itself acts as the paragraph. */
export const DOM_LEVELS: Level[] = [words, sentences, whole];

/**
 * Returns the smallest unit that contains `sel` and is strictly larger than it,
 * or null if `sel` already covers the largest unit.
 *
 * A collapsed caret touching a word (just before or just after it) counts as inside it.
 */
export function extendSpan(text: string, sel: TextSpan, levels: Level[]): TextSpan | null {
  for (const level of levels) {
    const unit = level(text).find((u) => u.start <= sel.start && sel.end <= u.end);
    if (unit && (unit.start < sel.start || unit.end > sel.end)) return unit;
  }
  return null;
}
