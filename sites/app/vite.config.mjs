import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { serveTestFixtures, svgLoaderForNeuroglancerIcons } from '../../vite.config.mjs';


export default defineConfig({
  base: './',
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    serveTestFixtures(),
    svgLoaderForNeuroglancerIcons(),
  ],
  define: {
    // References:
    // - https://github.com/smnhgn/vite-plugin-package-version/blob/master/src/index.ts#L10
    // - https://stackoverflow.com/a/70524430
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  server: {
    fs: {
      // Without this, Vite blocks data-URI query parameters,
      // such as http://localhost:3000/?url=data:,{}
      strict: false,
    },
  },
});


