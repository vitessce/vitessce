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
              inject: ['./src/alias/buffer-shim.js'],
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

// We can't inject a global `Buffer` polyfill for the worker entrypoint using vite alone,
// so we reuse the `bundle-web-worker` plugin to inject the buffer shim during production.
const manualInlineWorker = {
  apply: 'build',
  async transform(code, id) {
      if (id.endsWith('bam-worker.ts?worker&inline') || id.endsWith('vcf-worker.ts?worker&inline')) {
          const bundle = await bundleWebWorker.transform(code, id + '?worker_file');
          const base64 = Buffer.from(bundle).toString('base64');
          // https://github.com/vitejs/vite/blob/72cb33e947e7aa72d27ed0c5eacb2457d523dfbf/packages/vite/src/node/plugins/worker.ts#L78-L87
          return `const encodedJs = "${base64}";
const blob = typeof window !== "undefined" && window.Blob && new Blob([atob(encodedJs)], { type: "text/javascript;charset=utf-8" });
export default function() {
const objURL = blob && (window.URL || window.webkitURL).createObjectURL(blob);
try {
  return objURL ? new Worker(objURL) : new Worker("data:application/javascript;base64," + encodedJs, {type: "module"});
} finally {
  objURL && (window.URL || window.webkitURL).revokeObjectURL(objURL);
}
}`;
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
  plugins: [react(), manualInlineWorker]
});