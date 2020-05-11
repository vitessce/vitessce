process.env.NODE_ENV = "development";
process.env.BABEL_ENV = "development";

const rollupConfig = require('./rollup.config.demo');
// Remove development server plugins from the config.
const pluginsToRemove = ['livereload', 'serve'];
rollupConfig.plugins = rollupConfig.plugins.filter(({ name }) => !pluginsToRemove.includes(name));

module.exports = config => {
  config.set({
    plugins: [
        'karma-mocha',
        'karma-sourcemap-loader',
        'karma-chrome-launcher',
        'karma-mocha-reporter',
        // Reference: https://github.com/jlmakes/karma-rollup-preprocessor
        require('karma-rollup-preprocessor')
    ],
    basePath: 'src/',
    files: [
        // Rollup preprocessor does its own watching.
        // Reference: https://github.com/jlmakes/karma-rollup-preprocessor
        { pattern: '**/*.test.js', watched: false },
    ],
    preprocessors: {
        // We want Rollup to process all JS files.
        '**/*.js': ['rollup', 'sourcemap'],
    },
    // Reference: https://github.com/jlmakes/karma-rollup-preprocessor
    rollupPreprocessor: rollupConfig,
    frameworks: ['mocha'],
    reporters: ['mocha'],
    browsers: ['ChromeLauncher'],
    customLaunchers: {
        // Use a custom launcher to be able to configure with flags.
        ChromeLauncher: {
            // This would be cleaner with 'ChromeHeadless' rather than 'Chrome'
            // but I cannot figure out how to disable network caching using the flags array, for either browser.
            // At least with 'Chrome' (GUI version) you can manually go into the Network tab and disable cache.
            base: 'Chrome',
            flags: [
                // HiGlass uses this option to enable running Karma on Travis.
                // Reference: https://github.com/higlass/higlass/blob/bdeb214b6159b46c583caade4cffa2417ca9c15e/karma.conf.js#L113
                // Not entirely sure why, or whether it is required.
                // Reference: https://github.com/theintern/intern/issues/878
                '--no-sandbox',
                // Tried the following flags to disable cache, but neither worked.
                // '--disk-cache-dir=/dev/null',
                // '--disk-cache-size=1',
            ]
        }
    },
    logLevel: config.LOG_DEBUG,
    port: 9876,
    colors: true
  });
};
