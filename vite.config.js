import react from '@vitejs/plugin-react';
import serveStatic from 'serve-static';
import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite plugins to serves contents of `packages/file-types/zarr/fixtures` during testing.
 * Reference: https://github.com/hms-dbmi/viv/blob/d8b0ae/sites/avivator/vite.config.js#L12
 */
export function serveTestFixtures() {
  const serveOptions = {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
    dotfiles: 'allow',
    acceptRanges: true,
    immutable: true,
    index: false,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  };
  const dirZarr = resolve(__dirname, './packages/file-types/zarr/fixtures');
  const serveZarr = serveStatic(dirZarr, serveOptions);
  const dirJson = resolve(__dirname, './packages/file-types/json/src/legacy-loaders/schemas/fixtures');
  const serveJson = serveStatic(dirJson, serveOptions);
  const dirVitS = resolve(__dirname, './packages/vit-s/src/schemas/fixtures');
  const serveVitS = serveStatic(dirVitS, serveOptions);
  return {
    name: 'serve-test-fixtures-dir',
    configureServer(server) {



      server.middlewares.use((req, res, next) => {
        if (/^\/@fixtures\/zarr\//.test(req.url)) {
          req.url = req.url.replace('/@fixtures/zarr/', '');
          serveZarr(req, res, next);
        } else if (/^\/@fixtures\/json-legacy\//.test(req.url)) {
          req.url = req.url.replace('/@fixtures/json-legacy/', '');
          serveJson(req, res, next);
        } else if (/^\/@fixtures\/vit-s\//.test(req.url)) {
          req.url = req.url.replace('/@fixtures/vit-s/', '');
          serveVitS(req, res, next);
        } else {
          next();
        }
      });
    }
  };
}

// For tests.
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    serveTestFixtures(),
  ],
  test: {
    api: 4204,
    passWithNoTests: true,
    testTimeout: 15000,
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, './vitest.setup.js')],
    deps: {
      inline: ['vitest-canvas-mock'],
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    // Only run test files that are within src/
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Coverage
    coverage: {
      enabled: true,
      reporter: ['text', 'json-summary', 'json', 'html'],
      provider: 'v8',
      include: [
        // Do not include hits from dist-tsc/ files
        // (e.g., from sibling sub-packages) in the coverage report.
        '**/src/**',
      ],
      exclude: [
        // Exclude test fixtures.
        '**/*.{test,spec}.fixtures.?(c|m)[jt]s?(x)'
      ]
    },
  },
  // To enable .js files that contain JSX to be imported by Vitest tests.
  // Reference: https://github.com/vitest-dev/vitest/issues/1564
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
});
