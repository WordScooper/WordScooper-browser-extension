import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: ({ browser }) => ({
    name: 'WordScooper: Extend selection with keyboard',
    short_name: 'WordScooper',
    description:
      'Select a word, then the sentence, then the paragraph - with one keyboard shortcut: Alt+Shift+Period, or ⌘⇧Space',
    permissions: ['activeTab', 'scripting'],
    commands: {
      'extend-selection': {
        // macOS needs its own key: Firefox runs a command *and* the key's normal action.
        // ⌘⇧Space is Sublime Text's "Expand Selection to Scope" on macOS.
        suggested_key: { default: 'Alt+Shift+Period', mac: 'Command+Shift+Space' },
        description: 'Extend selection (word → sentence → paragraph)',
      },
    },
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          id: '{54f1563a-e3dc-44a5-b5be-8fca1b945df5}', // stable Firefox add-on ID, needed for AMO signing
          // Intl.Segmenter needs 125; data_collection_permissions is understood from 140.
          strict_min_version: '140.0',
          data_collection_permissions: { required: ['none'] }, // required for new AMO add-ons
        },
      },
    }),
  }),
});
