'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');


const path = require('path');
const chalk = require('react-dev-utils/chalk');
const fs = require('fs-extra');
const webpack = require('webpack');
const configFactory = require('../config/webpack.config');
const paths = require('../config/paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');

const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.libIndexJs])) {
  process.exit(1);
}

// Generate configuration
const targets = [ 'umd', 'es' ];

function runBuildForTarget(i) {
    if(i < targets.length) {
        const target = targets[i];
        const config = configFactory('production', target);
        console.log(`Creating an optimized production build of the library (${target})...`);
        runBuild(config, target).then(() => {
            runBuildForTarget(i+1);
        })
    }
}

runBuildForTarget(0);

function runBuild(config, target) {
    // We require that you explicitly set browsers and do not fall back to
    // browserslist defaults.
    const { checkBrowsers } = require('react-dev-utils/browsersHelper');
    return checkBrowsers(paths.appPath, isInteractive)
        .then(() => {
            // First, read the current file sizes in build directory.
            // This lets us display how much they changed later.
            return measureFileSizesBeforeBuild(`${paths.libBuild}/${target}`);
        })
        .then(previousFileSizes => {
            // Remove all content but keep the directory so that
            // if you're in it, you don't end up in Trash
            fs.emptyDirSync(`${paths.libBuild}/${target}`);
            // Start the webpack build
            return build(previousFileSizes, config);
        })
        .then(
            ({ stats, previousFileSizes, warnings }) => {
            if (warnings.length) {
                console.log(chalk.yellow('Compiled with warnings.\n'));
                console.log(warnings.join('\n\n'));
                console.log(
                '\nSearch for the ' +
                    chalk.underline(chalk.yellow('keywords')) +
                    ' to learn more about each warning.'
                );
                console.log(
                'To ignore, add ' +
                    chalk.cyan('// eslint-disable-next-line') +
                    ' to the line before.\n'
                );
            } else {
                console.log(chalk.green('Compiled successfully.\n'));
            }

            console.log('File sizes after gzip:\n');
            printFileSizesAfterBuild(
                stats,
                previousFileSizes,
                `${paths.libBuild}/${target}`,
                WARN_AFTER_BUNDLE_GZIP_SIZE,
                WARN_AFTER_CHUNK_GZIP_SIZE
            );
            console.log();
            },
            err => {
            const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';
            if (tscCompileOnError) {
                console.log(
                chalk.yellow(
                    'Compiled with the following type errors (you may want to check these before deploying your app):\n'
                )
                );
                printBuildError(err);
            } else {
                console.log(chalk.red('Failed to compile.\n'));
                printBuildError(err);
                process.exit(1);
            }
            }
        )
        .catch(err => {
            if (err && err.message) {
            console.log(err.message);
            }
            process.exit(1);
        });
}

// Create the production build and print the deployment instructions.
function build(previousFileSizes, config) {
  // We used to support resolving modules according to `NODE_PATH`.
  // This now has been deprecated in favor of jsconfig/tsconfig.json
  // This lets you use absolute paths in imports inside large monorepos:
  if (process.env.NODE_PATH) {
    console.log(
      chalk.yellow(
        'Setting NODE_PATH to resolve modules absolutely has been deprecated in favor of setting baseUrl in jsconfig.json (or tsconfig.json if you are using TypeScript) and will be removed in a future major release of create-react-app.'
      )
    );
    console.log();
  }

  const compiler = webpack(config);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages;
      if (err) {
        if (!err.message) {
          return reject(err);
        }

        let errMessage = err.message;

        // Add additional information for postcss errors
        if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
          errMessage +=
            '\nCompileError: Begins at CSS selector ' +
            err['postcssNode'].selector;
        }

        messages = formatWebpackMessages({
          errors: [errMessage],
          warnings: [],
        });
      } else {
        messages = formatWebpackMessages(
          stats.toJson({ all: false, warnings: true, errors: true })
        );
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n'
          )
        );
        return reject(new Error(messages.warnings.join('\n\n')));
      }

      return resolve({
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      });
    });
  });
}
