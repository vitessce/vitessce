import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';


// We can't inject a global `Buffer` polyfill for the worker entrypoint using vite alone,
// so we reuse the `bundle-web-worker` plugin to inject the buffer shim during production.
const manualInlineWorker = {
  async transform(code, id) {
    console.log(code);
      if (id.endsWith('.worker.js')) {
          // https://github.com/vitejs/vite/blob/72cb33e947e7aa72d27ed0c5eacb2457d523dfbf/packages/vite/src/node/plugins/worker.ts#L78-L87
          return `
const blob = typeof window !== "undefined" && window.Blob && new Blob([atob(encodedJs)], { type: "text/javascript;charset=utf-8" });
${code}`;
      }
  }
};

export default {
  input: ["src/index.js"],
  output: {
    file: "dist/index.mjs",
    format: "esm",
    sourcemap: true
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    webWorkerLoader({
      targetPlatform: 'browser',
      inline: true,
      external: [],
    }),
  ],
};