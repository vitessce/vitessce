import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { serveTestFixtures } from '../../vite.config';

export default defineConfig({
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
});
