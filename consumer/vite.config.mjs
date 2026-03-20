import { defineConfig } from 'vite';
import path from 'path';

// Vite 7 uses Rolldown which doesn't properly handle React's CJS
// process.env.NODE_ENV conditional require pattern, causing the
// development build to leak into production bundles.
// Work around this by aliasing React entry points directly to
// their production CJS builds.
function reactProductionAlias(pkg, subpath, cjsFile) {
  const id = subpath ? `${pkg}/${subpath}` : pkg;
  return { find: id, replacement: path.resolve(`node_modules/${pkg}/cjs/${cjsFile}`) };
}

export default defineConfig({
  base: './',
  resolve: {
    alias: [
      reactProductionAlias('react', '', 'react.production.js'),
      reactProductionAlias('react', 'jsx-runtime', 'react-jsx-runtime.production.js'),
      reactProductionAlias('react', 'jsx-dev-runtime', 'react-jsx-runtime.production.js'),
      reactProductionAlias('react-dom', 'client', 'react-dom-client.production.js'),
      reactProductionAlias('react-dom', '', 'react-dom.production.js'),
    ],
  },
});
