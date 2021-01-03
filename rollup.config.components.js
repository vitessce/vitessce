const pkg = require('./package.json');
const { join } = require('path');
const fromEntries = require('object.fromentries');

const resolve = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const scss = require('rollup-plugin-scss');
const svgr = require('@svgr/rollup').default;
const commonjs = require('@rollup/plugin-commonjs');
const { babel } = require('@rollup/plugin-babel');
const replace = require('@rollup/plugin-replace');
const workers = require('rollup-plugin-web-worker-loader');
const empty = require('rollup-plugin-node-empty');
const builtins = require('rollup-plugin-node-builtins');
const { terser } = require('rollup-plugin-terser');

import {
    IN, OUT,
    COMPONENTS_LIST,
    PLUGIN_RESOLVE_OPTS,
    PLUGIN_COMMONJS_OPTS,
    PLUGIN_BABEL_OPTS,
    PLUGIN_REPLACE_OPTS,
    PLUGIN_WORKERS_OPTS,
    PLUGIN_TERSER_OPTS,
} from './rollup.constants';

const isProduction = process.env.NODE_ENV === 'production';

const outputBase = {
    // We want sourcemap files to be created for debugging purposes.
    // https://rollupjs.org/guide/en/#outputsourcemap
    sourcemap: true,
    // Since we want React and ReactDOM to be externals,
    // we need to tell the bundle how these libraries can be found as global variables.
    // Reference: https://rollupjs.org/guide/en/#outputglobals
    globals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
    }
};

module.exports = {
    input: {
        ...fromEntries(COMPONENTS_LIST.map(name => ([
            join('component', name),
            join(IN.COMPONENTS, name, 'index.js'),
        ]))),
    },
    output: [
        {
            // Reference: https://rollupjs.org/guide/en/#outputformat
            format: 'es',
            dir: OUT.LIB_DIR,
            // Create separate chunks for all modules using original file names as modules.
            // Reference: https://rollupjs.org/guide/en/#preservemodules
            preserveModules: true,
            entryFileNames: (isProduction ? OUT.LIB_ES_PROD_FILE : OUT.LIB_ES_DEV_FILE),
            chunkFileNames: (isProduction ? OUT.LIB_ES_PROD_CHUNK : OUT.LIB_ES_DEV_CHUNK),
            ...outputBase,
        }
    ],
    plugins: [
        // Tell Rollup how to resolve packages in node_modules.
        // Reference: https://github.com/rollup/plugins/tree/master/packages/commonjs#using-with-rollupplugin-node-resolve
        resolve(PLUGIN_RESOLVE_OPTS),
        // Tell Rollup how to handle JSON imports.
        json(),
        // Tell Rollup how to handle CSS and SCSS imports.
        scss({
            // By default, the plugin uses the same output filename,
            // where .js is replaced by .css
            output: true,
        }),
        // Tell Rollup how to handle SVG imports.
        svgr(),
        // Tell Rollup how to handle Web Worker scripts.
        workers(PLUGIN_WORKERS_OPTS),
        empty({
            fs: "empty",
            http: "empty",
            https: "empty",
            buffer: "empty",
            stream: "empty",
        }),
        // Need to convert CommonJS modules in node_modules to ES6.
        // Reference: https://github.com/rollup/plugins/tree/master/packages/node-resolve#using-with-rollupplugin-commonjs
        commonjs(PLUGIN_COMMONJS_OPTS),
        // Tell Rollup to compile our source files with Babel.
        // Note: This plugin respects Babel config files by default.
        // Reference: https://github.com/rollup/plugins/tree/master/packages/babel
        babel(PLUGIN_BABEL_OPTS),
        builtins(),
        replace(PLUGIN_REPLACE_OPTS),
        ...(isProduction ? [
            terser(PLUGIN_TERSER_OPTS)
        ] : []),
    ],
    // We do not to inclue React or ReactDOM in the bundle.
    external: ['react', 'react-dom']
};