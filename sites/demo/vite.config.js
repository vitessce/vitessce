import { defineConfig } from 'vite';
import * as esbuild from 'esbuild';
import react from '@vitejs/plugin-react';
import { serveTestFixtures } from '../../vite.config';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    serveTestFixtures,
  ],
});
