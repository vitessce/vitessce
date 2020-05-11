const pkg = require('./package.json');
const { join } = require('path');
const React = require('react');

const resolve = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const scss = require('rollup-plugin-scss');
const svgr = require('@svgr/rollup').default;
const commonjs = require('@rollup/plugin-commonjs');
const { babel } = require('@rollup/plugin-babel');
const { terser } = require('rollup-plugin-terser');

// Constants for output files.
const SRC_DIR = 'src';
const LIB_DIR = 'lib';
const ES_DIR = 'es';
const UMD_DIR = 'umd';
const INPUT_JS = 'index.js';
const UMD_OUTPUT_JS = join(UMD_DIR, 'vitessce-grid.js');
const UMD_OUTPUT_MIN_JS = join(UMD_DIR, 'vitessce-grid.min.js');

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

const outputModuleBase = {
    // Create separate chunks for all modules using original file names as modules.
    // Reference: https://rollupjs.org/guide/en/#preservemodules
    preserveModules: true,
    entryFileNames: (isProduction ? "[name].min.js" : "[name].js"),
    chunkFileNames: (isProduction ? "[name]-[hash].min.js" : "[name]-[hash].js"),
};

module.exports = {
    input: join(SRC_DIR, INPUT_JS),
    output: [
        {
            // Reference: https://rollupjs.org/guide/en/#outputformat
            format: 'es',
            dir: ES_DIR,
            ...outputBase,
            ...outputModuleBase,
        },
        {
            // Reference: https://rollupjs.org/guide/en/#outputformat
            format: 'cjs',
            dir: LIB_DIR,
            ...outputBase,
            ...outputModuleBase,
        },
        {
            // Reference: https://rollupjs.org/guide/en/#outputformat
            format: 'umd',
            // UMD builds require a name.
            name: pkg.name,
            file: (isProduction ? UMD_OUTPUT_MIN_JS : UMD_OUTPUT_JS),
            ...outputBase
        }
    ],
    plugins: [
        // Tell Rollup how to resolve packages in node_modules.
        // Reference: https://github.com/rollup/plugins/tree/master/packages/commonjs#using-with-rollupplugin-node-resolve
        resolve({
            browser: true,
        }),
        // Tell Rollup how to handle JSON imports.
        json(),
        // Tell Rollup how to handle CSS and SCSS imports.
        scss({
            output: join(DEMO_DIST_DIR, OUTPUT_CSS),
        }),
        // Tell Rollup how to handle SVG imports.
        svgr(),
        // Need to convert CommonJS modules in node_modules to ES6.
        // Reference: https://github.com/rollup/plugins/tree/master/packages/node-resolve#using-with-rollupplugin-commonjs
        commonjs({
            // Using this RegEx rather than 'node_modules/**' is suggested, to enable symlinks.
            // Reference: https://github.com/rollup/plugins/tree/master/packages/commonjs#usage-with-symlinks
            include: /node_modules/,
            namedExports: {
                // Need to explicitly tell Rollup how to handle imports like `React, { useState }`
                // Reference: https://github.com/rollup/rollup-plugin-commonjs/issues/407#issuecomment-527837831
                // Reference: https://github.com/facebook/react/issues/11503
                'node_modules/react/index.js': Object.keys(React)
            }
        }),
        // Tell Rollup to compile our source files with Babel.
        // Note: This plugin respects Babel config files by default.
        // Reference: https://github.com/rollup/plugins/tree/master/packages/babel
        babel({
            // The 'runtime' option is recommended when bundling libraries.
            // Reference: https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
            babelHelpers: 'runtime',
            // Only transpile our source code.
            // Reference: https://github.com/rollup/plugins/tree/master/packages/babel#extensions
            exclude: 'node_modules/**'
        }),
        ...(isProduction ? [
            terser()
        ] : [])
    ],
    // We do not to inclue React or ReactDOM in the bundle.
    external: ['react', 'react-dom']
};