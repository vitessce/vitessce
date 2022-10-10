// References:
// - https://github.com/gosling-lang/gosling.js/blob/master/vite.config.js
// - https://github.com/gosling-lang/gosling.js/blob/master/scripts/build-embed.js
// - https://github.com/gosling-lang/gosling.js/blob/master/scripts/build-umd.js
// - https://github.com/hms-dbmi/viv/blob/master/scripts/bundle.mjs
import * as esbuild from 'esbuild';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import pkg from './package.json';

const isProduction = process.env.APP_ENV === 'production';

/**
 * Bundles vite worker modules during development into single scripts.
 * see: https://github.com/hms-dbmi/viv/pull/469#issuecomment-877276110
 * @returns {import('vite').Plugin}
 */
 const bundleWebWorker = {
  name: 'bundle-web-worker',
  apply: 'serve', // plugin only applied with dev-server
  async transform(_, id) {
      if (/\?worker_file$/.test(id)) {
          // just use esbuild to bundle the worker dependencies
          const bundle = await esbuild.build({
              entryPoints: [id],
              format: 'iife',
              bundle: true,
              write: false
          });
          if (bundle.outputFiles.length !== 1) {
              throw new Error('Worker must be a single module.');
          }
          return bundle.outputFiles[0].text;
      }
  }
};

export default defineConfig({
  build: {
    sourcemap: true,
    emptyOutDir: false,
    minify: isProduction ? 'esbuild' : false,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'vitessce',
      fileName: isProduction ? 'index.min' : 'index',
      formats: isProduction ? ['umd'] : ['es', 'umd'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      }
    }
  },
  define: {
    'process.env.NODE_ENV': `"${process.env.APP_ENV}"`,
  },
  plugins: [react(), bundleWebWorker]
});