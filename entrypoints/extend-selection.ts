import { extendSelectionInPage } from '@/lib/dom-selection';

// Injected by the background script each time the shortcut is pressed.
export default defineUnlistedScript(() => extendSelectionInPage());
