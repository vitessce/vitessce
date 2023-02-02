import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { resolve, basename } from 'path';

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
      entry: resolve(cwd, 'src/index.js'),
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', ...moreExternals],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
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
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    // loader: "tsx",
    // include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
});
