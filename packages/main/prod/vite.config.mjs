// References:
// - https://github.com/gosling-lang/gosling.js/blob/master/vite.config.js
// - https://github.com/gosling-lang/gosling.js/blob/master/scripts/build-embed.js
// - https://github.com/gosling-lang/gosling.js/blob/master/scripts/build-umd.js
// - https://github.com/hms-dbmi/viv/blob/master/scripts/bundle.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from "rollup-plugin-visualizer";

const isProduction = process.env.APP_ENV === 'production';

export default defineConfig({
  build: {
    emptyOutDir: false,
    minify: isProduction ? 'esbuild' : false,
    sourcemap: false,
    target: 'es2020', // portal-ui cannot handle the nullish coalescing output by ESNext
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      fileName: isProduction ? 'index.min' : 'index',
      formats: ['es'],
      // name: 'vitessce', // Used for UMD builds
    },
    rollupOptions: {
      external: (id) => (
        id === 'react'
        || id === 'react-dom'
        || id.startsWith('react/')
        || id.startsWith('react-dom/')
        || id.startsWith('@react-three/')
        || id === 'three'
        || id.startsWith('three/')
      ),
      output: {
        // Lazy-loaded workspace packages all have index.js entries; name their chunks
        // after the package dir so names stay unique once CI strips hashes.
        // Rollup derives the default [name] from the chunk's last module.
        chunkFileNames: ({ name, moduleIds }) => {
          const pkgDir = moduleIds.at(-1)?.match(/([^/]+)\/dist-tsc\/index\.js$/)?.[1];
          return `${name === 'index' && pkgDir ? pkgDir : name}-[hash].js`;
        },
      },
      // output.globals required for UMD builds
      // (e.g., no longer used since only generating ESM build)
      /*
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
      */
    },
  },
  define: {
    'process.env.NODE_ENV': `"${process.env.APP_ENV}"`,
  },
  plugins: [
    react(),
    visualizer(),
  ],
});
