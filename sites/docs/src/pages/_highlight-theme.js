import darkTheme from './_prism-dark-theme.cjs.js';
import lightTheme from './_prism-light-theme.cjs.js';

// A custom theme for JSON syntax highlighting
// component from prism-react-renderer.
export function getHighlightTheme(isDarkTheme) {
  return isDarkTheme ? darkTheme : lightTheme;
}
