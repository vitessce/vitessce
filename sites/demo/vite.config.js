import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import { serveTestFixtures } from '../../vite.config';

// eslint-disable-next-line react-refresh/only-export-components
export default defineConfig({
  base: './',
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    serveTestFixtures,
  ],
  define: {
    // References:
    // - https://github.com/smnhgn/vite-plugin-package-version/blob/master/src/index.ts#L10
    // - https://stackoverflow.com/a/70524430
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  // Reference: https://github.com/vitejs/vite/discussions/3448#discussioncomment-749919
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'load-js-files-as-jsx',
          setup(build) {
            build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
              loader: 'jsx',
              contents: await fs.readFile(args.path, 'utf8'),
            }));
          },
        },
      ],
    },
  },
});
