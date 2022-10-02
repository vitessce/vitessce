import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vite';

// For tests.
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    svgr(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  // To enable .js files that contain JSX to be imported by Vitest tests.
  // Reference: https://github.com/vitest-dev/vitest/issues/1564
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    // loader: "tsx",
    // include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
});
