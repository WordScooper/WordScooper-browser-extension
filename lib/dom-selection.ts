import { DOM_LEVELS, TEXT_FIELD_LEVELS, extendSpan } from './text-units';

/** Input types that support `selectionStart` / `setSelectionRange`. */
const TEXT_INPUT_TYPES = new Set(['text', 'search', 'url', 'tel', 'password']);

type TextField = HTMLTextAreaElement | HTMLInputElement;

/** Extends the selection in the focused text field, or else in the page, by one level. */
export function extendSelectionInPage(doc: Document = document): void {
  const focused = deepActiveElement(doc);
  if (focused && isTextField(focused)) {
    extendTextFieldSelection(focused);
    return;
  }
  extendDomSelection(doc);
}

/** Follows `shadowRoot.activeElement` down into shadow DOM. */
function deepActiveElement(doc: Document): Element | null {
  let el = doc.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el;
}

function isTextField(el: Element): el is TextField {
  if (el.tagName === 'TEXTAREA') return true;
  return el.tagName === 'INPUT' && TEXT_INPUT_TYPES.has((el as HTMLInputElement).type);
}

function extendTextFieldSelection(el: TextField): void {
  const { selectionStart, selectionEnd } = el;
  if (selectionStart === null || selectionEnd === null) return;
  const span = extendSpan(el.value, { start: selectionStart, end: selectionEnd }, TEXT_FIELD_LEVELS);
  if (span) el.setSelectionRange(span.start, span.end);
}

function extendDomSelection(doc: Document): void {
  const selection = doc.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const body = doc.body;
  if (!body) return;

  let block: Element | null = nearestBlock(range.commonAncestorContainer, body);
  while (block) {
    const model = new TextModel(block);
    const start = model.offsetOf(range.startContainer, range.startOffset);
    const end = model.offsetOf(range.endContainer, range.endOffset);
    // Source line-wrapping puts newlines into textContent, and the sentence
    // segmenter treats every newline as a break. Same length, so offsets are kept.
    const text = model.text.replace(/[\r\n]/g, ' ');
    const span = extendSpan(text, { start, end }, DOM_LEVELS);
    if (span) {
      const from = model.pointAt(span.start);
      const to = model.pointAt(span.end);
      if (from && to) selection.setBaseAndExtent(from.node, from.offset, to.node, to.offset);
      return;
    }
    if (block === body) return;
    block = block.parentNode ? nearestBlock(block.parentNode, body) : null;
  }
}

/** Nearest ancestor-or-self element that isn't laid out inline. Falls back to `body`. */
function nearestBlock(node: Node, body: HTMLElement): Element {
  let el: Element | null = node instanceof Element ? node : node.parentElement;
  while (el && el !== body) {
    const display = getComputedStyle(el).display;
    if (!display.startsWith('inline') && display !== 'contents') return el;
    el = el.parentElement;
  }
  return body;
}

/** The text nodes of an element, concatenated, with a mapping between offsets and DOM points. */
class TextModel {
  readonly text: string;
  private readonly nodes: { node: Text; start: number; end: number }[] = [];

  constructor(private readonly root: Element) {
    const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let offset = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const length = (node as Text).data.length;
      this.nodes.push({ node: node as Text, start: offset, end: offset + length });
      offset += length;
    }
    this.text = this.nodes.map((n) => n.node.data).join('');
  }

  /** Offset in `text` of a DOM boundary point inside the root. */
  offsetOf(node: Node, offset: number): number {
    const range = this.root.ownerDocument.createRange();
    range.setStart(this.root, 0);
    try {
      range.setEnd(node, offset);
    } catch {
      return 0;
    }
    return range.toString().length;
  }

  /** DOM boundary point for an offset in `text`. */
  pointAt(offset: number): { node: Text; offset: number } | null {
    const entry = this.nodes.find((n) => n.start <= offset && offset <= n.end);
    return entry ? { node: entry.node, offset: offset - entry.start } : null;
  }
}
