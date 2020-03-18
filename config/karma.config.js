/*
 * This file has been adapted from the karma config used by HiGlass
 * https://github.com/higlass/higlass/blob/2ced03740cdcaeb3a6e822c70a926cb1e4b42016/karma.conf.js
 */

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.PUBLIC_URL = '';

const webpackConfig = require('./webpack.config.js');

module.exports = config => {
  config.set({
    /** * maximum number of tries a browser will attempt in the case
     * of a disconnection */
    browserDisconnectTolerance: 2,
    /** * How long will Karma wait for a message from a browser before
     * disconnecting from it (in ms). */
    browserNoActivityTimeout: 50000,
    basePath: '../src/',
    frameworks: ['mocha'],

    files: [
        { pattern: '**/*.test.js' },
    ],

    preprocessors: {
      '**/*.js': ['webpack', 'sourcemap']
    },

    // webpackConfig(env, argv)
    webpack: webpackConfig(process.env.NODE_ENV, 'demo'),

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
