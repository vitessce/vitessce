import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { resolve, basename } from 'path';
import { existsSync } from 'fs';

const cwd = process.cwd();

// Need to make vit-s external for dependents (but vit-s is not dependent on itself),
// otherwise there will be issues with Zustand stores.
const moreExternals = basename(cwd) === 'vit-s' ? [] : ['@vitessce/vit-s'];

// For bundling "sub-packages".
export default defineConfig({
  root: cwd,
  build: {
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    lib: {
      entry: existsSync(resolve(cwd, 'src/index.ts')) ? resolve(cwd, 'src/index.ts') : resolve(cwd, 'src/index.js'),
      // The file extension used by Vite depends on whether the package.json contains "type": "module".
      // Reference: https://github.com/vitejs/vite/blob/1ee0014caa7ecf91ac147dca3801820020a4b8a0/docs/guide/build.md?plain=1#L212
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', ...moreExternals],
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
  ],
  // To enable .js files that contain JSX to be imported.
  // Reference: https://github.com/vitest-dev/vitest/issues/1564
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
});
