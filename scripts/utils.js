

const path = require('path');
const chalk = require('react-dev-utils/chalk');
const fs = require('fs-extra');
const webpack = require('webpack');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const printHostingInstructions = require('react-dev-utils/printHostingInstructions');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');
const { checkBrowsers } = require('react-dev-utils/browsersHelper');

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

const moduleFileExtensions = [
  'mjs',
  'js',
  'ts',
  'tsx',
  'json',
  'jsx',
];


function copyPublicFolder(paths) {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}

function compile(config, target, previousFileSizes) {
  console.log(`Creating an optimized production build for target ${target}...`);

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
      if (process.env.CI
            && (typeof process.env.CI !== 'string' || process.env.CI.toLowerCase() !== 'false')
            && messages.warnings.length
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


function build(config, paths, target) {
    const isTargetDemo = (target === 'demo')
    const buildDir = (isTargetDemo ? paths.appBuild : path.join(paths.libBuild, target));

    const isInteractive = process.stdout.isTTY;

    checkRequiredFilesForTarget(paths, isTargetDemo);

    /**
     * The function to run before compilation.
     * @returns {Promise}
     */
    function preCompile() {
        // First, read the current file sizes in build directory.
        // This lets us display how much they changed later.
        return FileSizeReporter.measureFileSizesBeforeBuild(buildDir);
    }

    /**
     * The function to run after compilation.
     * @param {object} report
     * @param {*} report.stats
     * @param {*} report.previousFileSizes
     * @param {*} report.warnings
     */
    function postCompile({ stats, previousFileSizes, warnings }) {
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
        FileSizeReporter.printFileSizesAfterBuild(
            stats,
            previousFileSizes,
            buildDir,
            WARN_AFTER_BUNDLE_GZIP_SIZE,
            WARN_AFTER_CHUNK_GZIP_SIZE
        );
        console.log();
    }

    // We require that you explicitly set browsers and do not fall back to
    // browserslist defaults.
    return checkBrowsers(paths.appPath, isInteractive)
        .then(preCompile)
        .then(previousFileSizes => {
            // Remove all content but keep the directory so that
            // if you're in it, you don't end up in Trash
            fs.emptyDirSync(buildDir);
            if(isTargetDemo) {
                // Merge with the public folder
                copyPublicFolder(paths);
            }
            // Start the webpack build
            return compile(config, target, previousFileSizes);
        })
        .then(postCompile)
        .catch(err => {
            if (err && err.message) {
                console.log(err.message);
            }
            process.exit(1);
        });
}

function scriptInit() {
    // Makes the script crash on unhandled rejections instead of silently
    // ignoring them. In the future, promise rejections that are not handled will
    // terminate the Node.js process with a non-zero exit code.
    process.on('unhandledRejection', err => {
        throw err;
    });
}

function checkRequiredFilesForTarget(paths, isTargetDemo) {
    // Warn and crash if required files are missing
    if (isTargetDemo && !checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
        process.exit(1);
    } else if(!isTargetDemo && !checkRequiredFiles([paths.libIndexJs])) {
        process.exit(1);
    }
}

function checkHost() {
    if (process.env.HOST) {
        console.log(
            chalk.cyan(
            `Attempting to bind to HOST environment variable: ${chalk.yellow(
                chalk.bold(process.env.HOST)
            )}`
            )
        );
        console.log(
            `If this was unintentional, check that you haven't mistakenly set it in your shell.`
        );
        console.log(
            `Learn more here: ${chalk.yellow('https://bit.ly/CRA-advanced-config')}`
        );
        console.log();
    }
}
 
module.exports = {
    build,
    scriptInit,
    checkRequiredFilesForTarget,
    checkHost,
    moduleFileExtensions
};