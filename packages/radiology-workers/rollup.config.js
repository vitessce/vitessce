import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

// Like ../workers/rollup.config.js, with the worker inlined so that it does not depend
// on a relative URL. The Emscripten codec modules call require('fs') and require('path')
// only when running in Node, so those calls are left as they are.
export default {
  input: ['src/index.js'],
  output: {
    file: 'dist/index.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    nodeResolve({ browser: true }),
    commonjs({ ignore: ['fs', 'path'] }),
    webWorkerLoader({
      targetPlatform: 'browser',
      inline: true,
      external: [],
    }),
  ],
};
