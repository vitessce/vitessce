const pkg = require('./package.json');
const { join } = require('path');

const { nodeResolve } = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const scss = require('rollup-plugin-scss');
const svgr = require('@svgr/rollup').default;
const commonjs = require('@rollup/plugin-commonjs');
const { babel } = require('@rollup/plugin-babel');
const replace = require('@rollup/plugin-replace');
const html = require('@rollup/plugin-html');
const workers = require('rollup-plugin-web-worker-loader');
const empty = require('rollup-plugin-node-empty');
const builtins = require('rollup-plugin-node-builtins');
// Development server plugins.
const { htmlFromTemplate } = require('./rollup.utils');
import {
    IN, OUT,
    PLUGIN_RESOLVE_OPTS,
    PLUGIN_COMMONJS_OPTS,
    PLUGIN_BABEL_OPTS,
    PLUGIN_REPLACE_OPTS,
    PLUGIN_WORKERS_OPTS,
} from './rollup.constants.js';

module.exports = {
    input: IN.DEMO,
    output: {
        format: 'iife',
        // We want sourcemap files to be created for debugging purposes.
        // https://rollupjs.org/guide/en/#outputsourcemap
        sourcemap: 'inline',
        dir: OUT.DEMO_DIR,
    },
    plugins: [
        // Tell Rollup how to resolve packages in node_modules.
        // Reference: https://github.com/rollup/plugins/tree/master/packages/commonjs#using-with-rollupplugin-node-resolve
        nodeResolve(PLUGIN_RESOLVE_OPTS),
        // Tell Rollup how to handle JSON imports.
        json(),
        // Tell Rollup how to handle CSS and SCSS imports.
        scss({
            output: false,
            watch: 'src/css/index.scss',
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
        // Need to polyfill the node "events" package for NebulaGL.
        builtins(),
        replace(PLUGIN_REPLACE_OPTS),
        // We want Rollup to generate an HTML file for the demo.
        // Note: The default output filename is 'index.html'.
        html({
            // Our demo expects to find <div/> elements with particular IDs.
            // We need to use a custom templating function to override the default HTML output.
            // Reference: https://github.com/rollup/plugins/tree/master/packages/html#template
            template: htmlFromTemplate,
        }),
    ],
    // We do not want to declare any externals.
    // The demo needs React and ReactDOM even though these are externals for the library output.
    external: [],
    watch: {
        exclude: ['dist-demo', 'node_modules', '.git']
    }
};