import reactRefresh from '@vitejs/plugin-react-refresh';
import svgr from '@svgr/rollup';
import inject from '@rollup/plugin-inject';
import path from 'path';
import glslify from 'rollup-plugin-glslify';

function resolveBuffer() {
  return {
    name: 'resolve-empty-buffer',
    async load(id) {
      if (!id.includes('node_modules/buffer/index.js')) return;
      return `
      export const Buffer = '';
      `;
    },
  }
}

function resolveFs() {
  return {
    name: 'resolve-empty-fs',
    transform(src, id) {
      if (!id.includes('__vite-browser-external')) return;
      return `
      ${src}
      export const open = '';
      export const read = '';
      export const close = '';
      `;
    },
  }
}

/**
 * https://vitejs.dev/config/
 * @type { import('vite').UserConfig }
 */
export default {
  plugins: [
    resolveBuffer(),
    resolveFs(),
    inject({
      global: path.resolve( 'global.js' ),
    }),
    svgr(),
    glslify(),
    reactRefresh()
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'Vitessce'
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React'
        }
      }
    }
  }
}

