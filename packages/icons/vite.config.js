import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vite';
import { resolve } from 'path';

const isProduction = process.env.APP_ENV === 'production';

// For tests.
export default defineConfig({
  build: {
    sourcemap: true,
    emptyOutDir: false,
    minify: isProduction ? 'esbuild' : false,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'vitessce',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      }
    }
  },
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    svgr(),
  ],
});
