export default defineBackground(() => {
  browser.commands.onCommand.addListener(async (command, tab) => {
    if (command !== 'extend-selection') return;
    const tabId =
      tab?.id ?? (await browser.tabs.query({ active: true, currentWindow: true }))[0]?.id;
    if (tabId === undefined) return;
    try {
      await browser.scripting.executeScript({
        target: { tabId }, // main frame only; activeTab doesn't cover cross-origin iframes
        files: ['/extend-selection.js'],
      });
    } catch {
      // Restricted pages (chrome://, about:, web stores) - nothing we can do.
    }
  });
});
