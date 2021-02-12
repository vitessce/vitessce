import reactRefresh from '@vitejs/plugin-react-refresh';
import svgr from '@svgr/rollup';
import inject from '@rollup/plugin-inject';
import path from 'path';


/**
 * https://vitejs.dev/config/
 * @type { import('vite').UserConfig }
 */
export default {
  plugins: [
    inject({
      global: path.resolve( 'global.js' )
    }),
    svgr(),
    reactRefresh()
  ]
}

