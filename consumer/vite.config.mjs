import { defineConfig } from 'vite';
import { resolve } from 'path';

// Vite 7 uses Rolldown which doesn't properly handle React's CJS
// process.env.NODE_ENV conditional require pattern, causing the
// development build to leak into production bundles.
// Work around this by aliasing React entry points directly to
// their production CJS builds using exact-match regexes.
export default defineConfig({
  base: './',
  resolve: {
    alias: [
      { find: /^react$/, replacement: resolve('node_modules/react/cjs/react.production.js') },
      { find: /^react\/jsx-runtime$/, replacement: resolve('node_modules/react/cjs/react-jsx-runtime.production.js') },
      { find: /^react\/jsx-dev-runtime$/, replacement: resolve('node_modules/react/cjs/react-jsx-runtime.production.js') },
      { find: /^react-dom$/, replacement: resolve('node_modules/react-dom/cjs/react-dom.production.js') },
      { find: /^react-dom\/client$/, replacement: resolve('node_modules/react-dom/cjs/react-dom-client.production.js') },
    ],
  },
});
