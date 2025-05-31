import darkTheme from './_prism-dark-theme.js';
import lightTheme from './_prism-light-theme.js';

// A custom theme for JSON syntax highlighting
// component from prism-react-renderer.
export function getHighlightTheme(isDarkTheme) {
  return isDarkTheme ? darkTheme : lightTheme;
}
