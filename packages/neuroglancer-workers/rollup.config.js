import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

export default {
  input: ["src/index.js"],
  output: {
    file: "dist/index.js",
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
