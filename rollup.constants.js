const { join } = require('path');
const React = require('react');
const ReactDOM = require('react-dom');

export const IN = {
    DEMO: join('demo', 'src', 'index.js'),
    LIB: join('src', 'index.js'),
};

export const OUT = {
    // Demo
    DEMO_DIR: 'dist-demo',
    DEMO_JS: join('dist-demo', 'demo.js'),
    DEMO_CSS: join('dist-demo', 'demo.css'),
    // Library
    LIB_DIR: 'dist',
    LIB_UMD_PROD_FILE: 'index.umd.min.js',
    LIB_UMD_DEV_FILE: 'index.umd.js',
    LIB_ES_PROD_FILE: '[name].es.min.js',
    LIB_ES_DEV_FILE: '[name].es.js',
    LIB_ES_PROD_CHUNK: '[name]-[hash].es.min.js',
    LIB_ES_DEV_CHUNK: '[name]-[hash].es.js',
    LIB_CSS: join('dist', 'index.css'),
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
    namedExports: {
        // Need to explicitly tell Rollup how to handle imports like `React, { useState }`
        // Reference: https://github.com/rollup/rollup-plugin-commonjs/issues/407#issuecomment-527837831
        // Reference: https://github.com/facebook/react/issues/11503
        'node_modules/react/index.js': Object.keys(React),
        'node_modules/react-dom/index.js': Object.keys(ReactDOM),
        'node_modules/probe.gl/env.js': ['global', 'isBrowser', 'getBrowser'],
        'node_modules/react-is/index.js': ['isFragment', 'ForwardRef', 'Memo'],
        'node_modules/@hms-dbmi/viv/dist/bundle.es.js': ['VivViewerLayer', 'StaticImageLayer', 'createZarrLoader', 'createOMETiffLoader'],
        'node_modules/json2csv/dist/json2csv.umd.js': ['parse'],
        'node_modules/turf-jsts/jsts.min.js': ['GeoJSONReader', 'GeoJSONWriter', 'BufferOp'],
        'node_modules/lz-string/libs/lz-string.js': ['compressToEncodedURIComponent', 'decompressFromEncodedURIComponent'],
    }
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
};