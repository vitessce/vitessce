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
      // The file extension used by Vite depends on whether the package.json contains "type": "module".
      // Reference: https://github.com/vitejs/vite/blob/1ee0014caa7ecf91ac147dca3801820020a4b8a0/docs/guide/build.md?plain=1#L212
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
