import { describe, expect, it } from 'vitest';
import {
  TEXT_FIELD_LEVELS,
  extendSpan,
  paragraphs,
  sentences,
  type TextSpan,
} from '../lib/text-units';

function slice(text: string, span: TextSpan | null): string | null {
  return span ? text.slice(span.start, span.end) : null;
}

/** Selection for the first occurrence of `part` in `text`. */
function spanOf(text: string, part: string): TextSpan {
  const start = text.indexOf(part);
  if (start < 0) throw new Error(`"${part}" not in text`);
  return { start, end: start + part.length };
}

describe('extendSpan', () => {
  it('selects the word when the caret is in the middle of it', () => {
    const text = 'The quick brown fox.';
    const caret = text.indexOf('quick') + 2;
    const span = extendSpan(text, { start: caret, end: caret }, TEXT_FIELD_LEVELS);
    expect(slice(text, span)).toBe('quick');
  });

  it('selects the word when the caret is just after it', () => {
    const text = 'The quick brown fox.';
    const caret = text.indexOf('quick') + 'quick'.length;
    const span = extendSpan(text, { start: caret, end: caret }, TEXT_FIELD_LEVELS);
    expect(slice(text, span)).toBe('quick');
  });

  it('selects the word when the caret is just before it', () => {
    const text = 'The quick brown fox.';
    const caret = text.indexOf('brown');
    const span = extendSpan(text, { start: caret, end: caret }, TEXT_FIELD_LEVELS);
    expect(slice(text, span)).toBe('brown');
  });

  it('prefers the earlier word when the caret touches two words', () => {
    const text = 'foo-bar';
    const caret = text.indexOf('-');
    const span = extendSpan(text, { start: caret, end: caret }, TEXT_FIELD_LEVELS);
    expect(slice(text, span)).toBe('foo');
  });

  it('selects the word when the caret is at the very start of the text', () => {
    const text = 'Hello world.';
    const span = extendSpan(text, { start: 0, end: 0 }, TEXT_FIELD_LEVELS);
    expect(slice(text, span)).toBe('Hello');
  });

  it('grows word → sentence → paragraph → whole when fed back in', () => {
    const text = 'First sentence here. Second one.\nAnother paragraph.';
    const caret = text.indexOf('one') + 1;
    const steps: (string | null)[] = [];
    let sel: TextSpan | null = { start: caret, end: caret };
    while (sel) {
      sel = extendSpan(text, sel, TEXT_FIELD_LEVELS);
      steps.push(slice(text, sel));
    }
    expect(steps).toEqual([
      'one',
      'Second one.',
      'First sentence here. Second one.',
      'First sentence here. Second one.\nAnother paragraph.',
      null,
    ]);
  });

  it('matches the "Try it" text-field example in README.md and the store listing', () => {
    const text = 'Ice cream is cold. It tastes sweet.';
    const caret = text.indexOf('tastes') + 3;
    const steps: (string | null)[] = [];
    let sel: TextSpan | null = { start: caret, end: caret };
    while (sel) {
      sel = extendSpan(text, sel, TEXT_FIELD_LEVELS);
      steps.push(slice(text, sel));
    }
    expect(steps).toEqual(['tastes', 'It tastes sweet.', 'Ice cream is cold. It tastes sweet.', null]);
  });

  it('selects the sentence when the selection spans two words', () => {
    const text = 'One two three. Four five.';
    const span = extendSpan(text, spanOf(text, 'two thr'), TEXT_FIELD_LEVELS);
    expect(slice(text, span)).toBe('One two three.');
  });

  it('selects the paragraph when the selection spans two sentences', () => {
    const text = 'One two. Three four. Five six.\nNext line.';
    const span = extendSpan(text, spanOf(text, 'two. Three'), TEXT_FIELD_LEVELS);
    expect(slice(text, span)).toBe('One two. Three four. Five six.');
  });

  it('returns null at the largest level', () => {
    const text = '  Just this.  ';
    const span = extendSpan(text, spanOf(text, 'Just this.'), TEXT_FIELD_LEVELS);
    expect(span).toBeNull();
  });

  it('handles non-English text', () => {
    const text = 'Grüße aus Dresden. Schönes Wetter!';
    const caret = text.indexOf('Schönes') + 3;
    const word = extendSpan(text, { start: caret, end: caret }, TEXT_FIELD_LEVELS);
    expect(slice(text, word)).toBe('Schönes');
    const sentence = extendSpan(text, word!, TEXT_FIELD_LEVELS);
    expect(slice(text, sentence)).toBe('Schönes Wetter!');
    const first = extendSpan(text, spanOf(text, 'Grüße'), TEXT_FIELD_LEVELS);
    expect(slice(text, first)).toBe('Grüße aus Dresden.');
  });
});

describe('sentences', () => {
  it('excludes trailing whitespace', () => {
    const text = 'One sentence.   Another one.  ';
    expect(sentences(text).map((s) => slice(text, s))).toEqual(['One sentence.', 'Another one.']);
  });
});

describe('paragraphs', () => {
  it('splits on newlines and skips blank lines', () => {
    const text = 'First line.\n\n  Second line.  \nThird.';
    expect(paragraphs(text).map((p) => slice(text, p))).toEqual([
      'First line.',
      'Second line.',
      'Third.',
    ]);
  });
});
