# Store listing (Chrome Web Store and Firefox Add-ons)

Text to paste into the store listings. Keep this in sync with README.md.

**Name:** WordScooper: Extend selection keyboard shortcut

**Summary (manifest description):** Select a word, then the sentence, then the paragraph — with one keyboard shortcut. No more fiddly mouse dragging.

## Description

Selecting text with the mouse is fiddly: you overshoot, miss the first letter, or grab half a line too much. WordScooper adds one keyboard shortcut that grows the selection step by step:

word → sentence → paragraph → whole text

Put the cursor anywhere in a word (or select a few words) and press **Alt+Shift+.** (period), or **⌘⇧Space** (Command+Shift+Space) on a Mac. Press it again to grow the selection further. It works in text fields, text areas, editable areas such as e-mail editors, and ordinary page text.

**Try it in one minute** (on a Mac, press ⌘⇧Space (Command+Shift+Space) wherever it says Alt+Shift+.):

On ordinary page text:
1. Open the Wikipedia article on ice cream: https://en.wikipedia.org/wiki/Ice_cream
2. In the first paragraph of the article, double-click a word that isn't a link (not blue). Your browser selects that word.
3. Press Alt+Shift+. (period). The selection grows to the whole sentence around that word.
4. Press Alt+Shift+. again. The selection grows to the whole paragraph.
5. Keep pressing. The selection grows to ever larger parts of the page, up to the whole article.
6. Press Ctrl+C (Cmd+C on a Mac) to copy what you selected, or click anywhere to start over.

In a text field:
1. On the same page, click the Wikipedia search box at the top and type: Ice cream is cold. It tastes sweet.
2. Click into the middle of the word "tastes", so the text cursor blinks inside it. Nothing is selected yet.
3. Press Alt+Shift+. The word "tastes" is selected.
4. Press Alt+Shift+. again. "It tastes sweet." is selected.
5. Press Alt+Shift+. once more. All of the text in the search box is selected.

Nothing happens? Make sure the browser window is active and you aren't on a browser page such as the new-tab page or the add-on store. There, browsers don't allow extensions to run. If another program uses the same shortcut, pick a different one (see "Change the shortcut" below).

Programmers will know this from their editors:

- PyCharm, IntelliJ IDEA and other JetBrains IDEs: "Extend Selection"
- NetBeans: "Select Next Element" (Alt+Shift+.), which is where WordScooper's default shortcut comes from
- Visual Studio Code and Visual Studio: "Expand Selection"
- Eclipse: "Select Enclosing Element"
- Sublime Text: "Expand Selection to Scope"
- Emacs: the expand-region package
- Microsoft Word: press F8 repeatedly

WordScooper brings the same idea to every web page.

**Languages:** word and sentence boundaries come from the browser's built-in language rules, so German, French, Spanish and many other languages work, not just English.

**Change the shortcut:** choose a combination that doesn't type a character. On a Mac, make sure to include command or control in your combination.
- Chrome: open chrome://extensions/shortcuts
- Firefox: open about:addons, click the gear icon, then "Manage Extension Shortcuts"

**Privacy:** WordScooper only runs on a page when you press its shortcut. It can't read your pages otherwise, stores nothing and sends nothing anywhere. It asks for no "read and change all your data on all websites" permission.

**Limitations:** it doesn't work on the browser's own pages or the add-on stores, or inside embedded frames from other websites.

Source code (GPL-3.0): https://github.com/WordScooper/WordScooper-browser-extension
