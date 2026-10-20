# WordScooper

A browser extension for Chrome and Firefox that adds an "extend selection" keyboard shortcut to any web page. Each press
grows the selection one step:

word → sentence → paragraph → whole text

Default shortcut:

- Windows/Linux: **Alt+Shift+.** (period)
- macOS: **⌘⇧Space** (Command+Shift+Space), like Sublime Text's "Expand Selection to Scope".
  Firefox runs an extension shortcut *and* the key's normal action, so the Mac key must do nothing by itself:
  Option+Shift+. types ˘ or ÷, and ⌥↑ (JetBrains' key) moves the cursor to the start of the line first.

Rebind it in:

- Chrome: `chrome://extensions/shortcuts`
- Firefox: `about:addons` → ⚙ → Manage Extension Shortcuts

It works in `<textarea>` and text `<input>` fields, `contenteditable` areas (e.g. Gmail compose), and ordinary page text
(including caret browsing, F7).

## Try it

On macOS, press ⌘⇧Space (Command+Shift+Space) wherever it says Alt+Shift+.

On page text:

1. Open https://en.wikipedia.org/wiki/Ice_cream.
2. In the first paragraph, double-click a word that isn't a link. The browser selects the word.
3. Press Alt+Shift+. → the surrounding sentence is selected.
4. Press again → the paragraph.
5. Keep pressing → ever larger enclosing blocks, up to the whole article.

In a text field:

1. On the same page, type `Ice cream is cold. It tastes sweet.` into the search box.
2. Click into the middle of "tastes" (caret only, no selection).
3. Press Alt+Shift+. → `tastes`.
4. Press again → `It tastes sweet.`
5. Press again → the whole text in the box.

## The same idea elsewhere

| Program                                    | Command                   | Default key                                       |
|--------------------------------------------|---------------------------|---------------------------------------------------|
| JetBrains IDEs (PyCharm, IntelliJ IDEA, …) | Extend Selection          | Ctrl+W (Windows/Linux), ⌥↑ (macOS)                |
| NetBeans                                   | Select Next Element       | Alt+Shift+.                                       |
| Visual Studio Code                         | Expand Selection          | Shift+Alt+→ (Windows/Linux), ⌃⇧→ (macOS)          |
| Visual Studio                              | Expand Selection          | Shift+Alt+=                                       |
| Eclipse                                    | Select Enclosing Element  | Alt+Shift+↑                                       |
| Sublime Text                               | Expand Selection to Scope | Ctrl+Shift+Space (Windows/Linux), ⌘⇧Space (macOS) |
| Emacs                                      | `expand-region` package   | commonly bound to `C-=`                           |
| Helix                                      | `expand_selection`        | Alt+o                                             |
| Microsoft Word                             | Extend mode               | F8, pressed repeatedly (Shift+F8 shrinks)         |

**LibreOffice Writer** has no single "grow the selection" command. It has separate commands, which can each be bound to
a key in Tools → Customize → Keyboard:

- `.uno:SelectWord` (Select Word)
- `.uno:SelectSentence` (Select Sentence, added in LibreOffice
  6.3, [tdf#124552](https://bugs.documentfoundation.org/show_bug.cgi?id=124552))
- `.uno:SelectText` (Select Paragraph)

A single command that cycles through them was proposed
in [tdf#137494](https://bugs.documentfoundation.org/show_bug.cgi?id=137494).

## How it works

- **Permissions:** only `activeTab` and `scripting`. No host permissions and no always-on content script, so the stores
  show no "read and change all your data on all websites" warning. The background script injects `extend-selection.js`
  into the active tab only when the shortcut is pressed.
- **No stored state.** The next step is worked out from the current selection alone: the smallest unit (word, sentence,
  paragraph, …) that contains the selection and is strictly larger than it.
- **Languages:** word and sentence boundaries come from `Intl.Segmenter`, so German and other languages work, not just
  English.
- **Text fields** (`<textarea>`, `<input type="text|search|url|tel|password">`): word → sentence → line → whole value.
- **Page text and `contenteditable`:** word → sentence → enclosing block element (paragraph) → the next enclosing block,
  and so on up to `<body>`.

Code layout:

```
entrypoints/background.ts        on command → scripting.executeScript the unlisted script
entrypoints/extend-selection.ts  the injected script
lib/text-units.ts                pure logic: word/sentence/paragraph spans, extendSpan()
lib/dom-selection.ts             text fields + DOM/contenteditable selection handling
tests/text-units.test.ts         vitest
```

## Development

Built with [WXT](https://wxt.dev). Needs Node 24 and [just](https://github.com/casey/just). Common commands are in the
`justfile`; run `just` to list them.

```sh
just install       # npm install
just dev-chrome    # Chrome with the extension loaded and live reload
just dev-firefox   # same for Firefox
just test          # unit tests
just check         # tests, type-check, and both builds (what CI runs)
just zip           # store-ready zips in .output/
```

Load a build by hand:

- Chrome: `chrome://extensions` → Developer mode → Load unpacked → `.output/chrome-mv3`
- Firefox: `about:debugging` → This Firefox → Load Temporary Add-on → `.output/firefox-mv2/manifest.json`

Things to try by hand after modifications:
a textarea, an input, a `contenteditable` area (e.g. Gmail compose), and plain article text.

Store listing text is in [`store/description.md`](store/description.md).

## Known limitations

- No shrink shortcut. Shrinking needs to remember the previous selections, unlike growing.
- Main frame only: the shortcut does nothing when the focus is inside a cross-origin iframe.
- `foo<br>bar` is read as the single word "foobar", because `<br>` adds no text to `textContent`.
- The shortcut doesn't work on browser pages (`chrome://`, `about:`) or the add-on stores.
- A page's own key handlers may also react to Alt+Shift+Period.
- If you rebind the shortcut to a key combination that types a character (on macOS, most Option combinations), the
  character is typed as well. Firefox then also extends the selection; Chrome types only the character. Likewise, in
  Firefox a key with its own action (such as ⌥↑, which moves the cursor) still performs it before the selection is
  extended. On macOS, you can use Hammerspoon to rewire the keyboard and assign different shortcuts to this browser extension. 
- Firefox 140 or newer is required (`Intl.Segmenter` needs 125; AMO's `data_collection_permissions` key needs 140).

## Maintainer

[Gogowitsch](https://github.com/Gogowitsch), christian@blaeul.de

## License

Copyright (C) 2026 Christian Bläul

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the [GNU General Public License v3.0](LICENSE) for more details.
