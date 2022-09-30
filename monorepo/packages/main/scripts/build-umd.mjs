import * as esbuild from 'esbuild';
import path from 'path';

esbuild.build({
    entryPoints: [path.resolve('./dist/vitessce.mjs')],
    target: 'es2018',
    outfile: "dist/index.umd.js",
    bundle: true,
    format: 'cjs',
    minify: false,
    sourcemap: true,
    //inject: [path.resolve(__dirname, '../src/alias/buffer-shim.js')],
    external: ['react', 'react-dom'],
    /*define: {
        'process.platform': 'undefined',
        'process.env.THREADS_WORKER_INIT_TIMEOUT': 'undefined'
    },*/
    // esbuild doesn't support UMD format directy. The banner/footer
    // wraps the commonjs output as a UMD module. The function signature is copied
    // from what is generated from rollup. If the external UMD dependencies change
    // (or the name of the gosling global) this needs changing.
    banner: {
        js: `\
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('react-dom')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', 'react-dom'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.vitessce = {}, global.React, global.ReactDOM));
}(this, (function (exports, React, ReactDOM) { 'use strict';
var __mods = { 'react': React, 'react-dom': ReactDOM };
var require = name => __mods[name];
`
    },
    footer: { js: '\n})));' }
});