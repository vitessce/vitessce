/*
 * This file has been adapted from the karma config used by HiGlass
 * https://github.com/higlass/higlass/blob/2ced03740cdcaeb3a6e822c70a926cb1e4b42016/karma.conf.js
 * and the nwb karma config generator function
 * https://github.com/insin/nwb/blob/44530220491c4ba3483d0f2b4abca8db3e6286cd/src/createKarmaConfig.js
 */

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.PUBLIC_URL = '';

const paths = require('./paths');
const configFactory = require('./webpack.config-demo');

module.exports = config => {
  config.set({
    // The maximum number of tries a browser will attempt upon disconnection.
    browserDisconnectTolerance: 2,
    // How long will Karma wait for a message from a browser before disconnecting?
    browserNoActivityTimeout: 50000,
    captureTimeout: 50000,
    browserDisconnectTimeout: 50000, // in ms
    basePath: '../src/',

    files: [
        { pattern: '**/*.test.js' },
    ],

    preprocessors: {
      '**/*.js': ['webpack', 'sourcemap']
    },
    
    frameworks: ['mocha', 'webpack'],

    webpack: {
      ...configFactory(paths, process.env.NODE_ENV),
      entry: undefined,
      output: undefined,
      devtool: 'inline-source-map'
    },
    webpackServer: {
      //noInfo: true // please don't spam the console when running in karma!
    },
    babelPreprocessor: {
      options: {
        presets: ['airbnb']
      }
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: false
  });
};
