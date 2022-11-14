// References:
// - https://github.com/gosling-lang/gosling.js/blob/master/vite.config.js
// - https://github.com/gosling-lang/gosling.js/blob/master/scripts/build-embed.js
// - https://github.com/gosling-lang/gosling.js/blob/master/scripts/build-umd.js
// - https://github.com/hms-dbmi/viv/blob/master/scripts/bundle.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from "rollup-plugin-visualizer";

const isProduction = process.env.APP_ENV === 'production';

export default defineConfig({
  build: {
    emptyOutDir: false,
    minify: isProduction ? 'esbuild' : false,
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'vitessce',
      fileName: isProduction ? 'index.min' : 'index',
      formats: ['es', 'umd'],
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
  define: {
    'process.env.NODE_ENV': `"${process.env.APP_ENV}"`,
  },
  plugins: [
    react(),
    visualizer(),
  ],
});