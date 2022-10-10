import { defineConfig } from 'vite';
import * as esbuild from 'esbuild';
import react from '@vitejs/plugin-react';

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
  plugins: [react({
    jsxRuntime: 'classic',
  }), bundleWebWorker]
});
