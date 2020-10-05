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
    browserNoActivityTimeout: 20000, // in ms
    basePath: '../src/',
    frameworks: ['mocha'],

    files: [
        { pattern: '**/*.test.js' },
    ],

    preprocessors: {
      '**/*.js': ['webpack', 'sourcemap']
    },

    webpack: configFactory(paths, process.env.NODE_ENV),
    webpackServer: {
      noInfo: true // please don't spam the console when running in karma!
    },
    plugins: [
      'karma-webpack',
      'karma-mocha',
      'karma-sourcemap-loader',
      'karma-chrome-launcher',
      'karma-mocha-reporter'
    ],
    babelPreprocessor: {
      options: {
        presets: ['airbnb']
      }
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false
  });
};
