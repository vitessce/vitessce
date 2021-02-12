import reactRefresh from '@vitejs/plugin-react-refresh';
import svgr from '@svgr/rollup';
import inject from '@rollup/plugin-inject';
import path from 'path';

/* 
* Custom Rollup Plugin for installing geotiff.js
*
* vizarr doesn't use geotiff component of viv.
* This plugin just creates an empty shim for 
* top-level imports in viv during install by snowpack.
*/

function resolveGeotiff() {
  return {
    name: 'resolve-empty-geotiff',
    async load(id) {
      if (!id.includes('geotiff.js')) return;
      return `
      export const fromBlob = '';
      export const fromUrl = '';
      `;
    },
  }
}

function resolveLoaders() {
  return {
    name: 'resolve-empty-loaders-gl',
    async load(id) {
      if (!id.includes('require-utils.node')) return;
      return `
      export const node = '';
      `;
    }
  }
}


/**
 * https://vitejs.dev/config/
 * @type { import('vite').UserConfig }
 */
export default {
  plugins: [
    inject({
      global: path.resolve( 'global.js' )
    }),
    resolveLoaders(),
    resolveGeotiff(),
    svgr(),
    reactRefresh()
  ]
}

