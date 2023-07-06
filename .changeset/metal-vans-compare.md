---
"@vitessce/config": patch
"docs": patch
---

Implement hints for zero config mode.

- Added a list of hints that user will select from, when using the zero config mode feature.
- Modified the user interface, defined in `_ViewConfigEditor.js`:
  - Defined a list of hints, which depend on the types of the files the user pastes URLs for.
  - Removed the `Generate Config` button. Now each hint is a button that generates the view config when pressed.
- Created a new file `constants.js` in `packages/config` that defines the range of supported hints, along with the name and coordinates of the desired layers.
- Modified `VitessceAutoConfig.js`:
  - Added a function to return the type of files the user pasted the URLs for. The function is used in `_ViewConfigEditor.js` to determine what set of hints to display.
  - Adapted the existing code to take selected hint into an account, when creating the view config.