// Do this as the first thing so that any code reading it knows the right env.
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
    browsers: ['HeadlessChrome'],
    singleRun: false,
    customLaunchers: {
      TravisChrome: {
        base: 'Chrome',
        flags: ['--no-sandbox', '--headless']
      },
      HeadlessChrome: {
        base: 'ChromeHeadless',
        flags: [
          '--disable-translate',
          '--disable-extensions',
          '--remote-debugging-port=9223'
        ]
      }
    }
  });

  if (process.env.TRAVIS) {
    config.browsers = ['TravisChrome'];
  }
};
