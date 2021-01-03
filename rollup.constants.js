const { join } = require('path');
const React = require('react');
const ReactDOM = require('react-dom');

export const IN = {
    DEMO: join('demo', 'src', 'index.js'),
    LIB: join('src', 'index.js'),
    COMPONENTS: join('src', 'components'),
};

export const OUT = {
    // Demo
    DEMO_DIR: 'dist-demo',
    DEMO_JS: join('dist-demo', 'demo.js'),
    DEMO_CSS: join('dist-demo', 'demo.css'),
    // Library
    LIB_DIR: 'dist',
    LIB_UMD_PROD_FILE: join('dist', 'index.umd.min.js'),
    LIB_UMD_DEV_FILE: join('dist', 'index.umd.js'),
    LIB_ES_PROD_FILE: '[name].es.min.js',
    LIB_ES_DEV_FILE: '[name].es.js',
    LIB_ES_PROD_CHUNK: '[name]-[hash].es.min.js',
    LIB_ES_DEV_CHUNK: '[name]-[hash].es.js',
    LIB_CSS: join('dist', 'index.css'),
};

export const COMPONENTS_LIST =[
    'tooltip',
    'layer-controller',
    'genes',
    'heatmap',
    'scatterplot',
    'sets',
    'spatial',
    'status',
];

export const PLUGIN_RESOLVE_OPTS = {
    browser: true,
    // Disable warnings like (!) Plugin node-resolve: preferring built-in module 'url' over local alternative.
    preferBuiltins: false,
};

export const PLUGIN_COMMONJS_OPTS = {
    // Using this RegEx rather than 'node_modules/**' is suggested, to enable symlinks.
    // Reference: https://github.com/rollup/plugins/tree/master/packages/commonjs#usage-with-symlinks
    include: /node_modules/,
    exclude: [
        'node_modules/zarr/dist/zarr.es6.js',
        // The following are to fix [!] Error: 'import' and 'export' may only appear at the top level.
        // Reference: https://github.com/rollup/plugins/issues/304
        'node_modules/probe.gl/dist/esm/lib/log.js',
        'node_modules/symbol-observable/es/index.js',
        'node_modules/is-observable/node_modules/symbol-observable/es/index.js',
        'src/components/heatmap/heatmap.worker.js'
    ],
};

export const PLUGIN_BABEL_OPTS = {
    // The 'runtime' option is recommended when bundling libraries.
    // Reference: https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
    babelHelpers: 'runtime',
    // Only transpile our source code.
    // Reference: https://github.com/rollup/plugins/tree/master/packages/babel#extensions
    exclude: 'node_modules/**'
};

export const PLUGIN_REPLACE_OPTS = {
    // React uses process.env to determine whether a development or production environment.
    // Reference: https://github.com/rollup/rollup/issues/487#issuecomment-177596512
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    // Reference: https://github.com/hubmapconsortium/vitessce-image-viewer/blob/v0.1.7/rollup.config.js
    "require('readable-stream/transform')": "require('stream').Transform",
    'require("readable-stream/transform")': 'require("stream").Transform',
    'readable-stream': 'stream'
};

export const PLUGIN_WORKERS_OPTS = {
    targetPlatform: 'browser',
    inline: true,
    skipPlugins: ['react-refresh-runtime']
};

export const PLUGIN_TERSER_OPTS = {
    // Use the terser options from Create React App.
    parse: {
        // We want terser to parse ecma 8 code. However, we don't want it
        // to apply any minification steps that turns valid ecma 5 code
        // into invalid ecma 5 code. This is why the 'compress' and 'output'
        // sections only apply transformations that are ecma 5 safe
        // https://github.com/facebook/create-react-app/pull/4234
        ecma: 8,
    },
    compress: {
        ecma: 5,
        warnings: false,
        // Disabled because of an issue with Uglify breaking seemingly valid code:
        // https://github.com/facebook/create-react-app/issues/2376
        // Pending further investigation:
        // https://github.com/mishoo/UglifyJS2/issues/2011
        comparisons: false,
        // Disabled because of an issue with Terser breaking valid code:
        // https://github.com/facebook/create-react-app/issues/5250
        // Pending further investigation:
        // https://github.com/terser-js/terser/issues/120
        inline: 2,
    },
    mangle: {
        safari10: true,
    },
    // Added for profiling in devtools
    keep_classnames: false,
    keep_fnames: false,
    output: {
        ecma: 5,
        comments: false,
        // Turned on because emoji and regex is not minified properly using default
        // https://github.com/facebook/create-react-app/issues/2488
        ascii_only: true,
    },
};