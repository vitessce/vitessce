const pkg = require('./package.json');
const { join } = require('path');
const React = require('react');
const ReactDOM = require('react-dom');

const resolve = require('@rollup/plugin-node-resolve');
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
const serve = require('rollup-plugin-serve');
const livereload = require('rollup-plugin-livereload');
const { htmlFromTemplate } = require('./rollup.utils');
import {
    IN, OUT,
    PLUGIN_COMMONJS_OPTS,
    PLUGIN_BABEL_OPTS,
    PLUGIN_REPLACE_OPTS,
    PLUGIN_WORKERS_OPTS,
} from './rollup.constants';

module.exports = {
    input: IN.DEMO,
    output: {
        format: 'umd',
        // We want sourcemap files to be created for debugging purposes.
        // https://rollupjs.org/guide/en/#outputsourcemap
        sourcemap: true,
        dir: OUT.DEMO_DIR,
    },
    plugins: [
        // Tell Rollup how to resolve packages in node_modules.
        // Reference: https://github.com/rollup/plugins/tree/master/packages/commonjs#using-with-rollupplugin-node-resolve
        resolve({
            browser: true,
            // Disable warnings like (!) Plugin node-resolve: preferring built-in module 'url' over local alternative.
            preferBuiltins: false,
        }),
        // Tell Rollup how to handle JSON imports.
        json(),
        // Tell Rollup how to handle CSS and SCSS imports.
        scss({
            output: OUT.DEMO_CSS,
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
        // Serve the demo on port 3000 for development.
        serve({
            port: 3000,
            contentBase: OUT.DEMO_DIR,
        }),
        // Reload the development server when demo outputs change.
        livereload(OUT.DEMO_DIR)
    ],
    // We do not want to declare any externals.
    // The demo needs React and ReactDOM even though these are externals for the library output.
    external: []
};