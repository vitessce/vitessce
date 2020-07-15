const fs = require('fs');
const path = require('path');
const chalk = require('react-dev-utils/chalk');
const utils = require("./utils");
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssNormalize = require('postcss-normalize');
const safePostCssParser = require('postcss-safe-parser');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

const moduleFileExtensions = utils.moduleFileExtensions;
const imageInlineSizeLimit = 10000;
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

// WARNING: This function still relies on the global `process.env`!!
function getClientEnvironment(nodeEnv, publicUrl) {
    // Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
    // injected into the application via DefinePlugin in webpack configuration.
    const REACT_APP = /^REACT_APP_/i;
  
    const raw = Object.keys(process.env)
      .filter(key => REACT_APP.test(key))
      .reduce(
        (env, key) => {
          env[key] = process.env[key];
          return env;
        },
        {
          // Useful for determining whether we’re running in production mode.
          // Most importantly, it switches React into the correct mode.
          NODE_ENV: nodeEnv,
          // Useful for resolving the correct path to static assets in `public`.
          // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
          // This should only be used as an escape hatch. Normally you would put
          // images into the `src` and `import` them in code to get their paths.
          PUBLIC_URL: publicUrl,
          // We support configuring the sockjs pathname during development.
          // These settings let a developer run multiple simultaneous projects.
          // They are used as the connection `hostname`, `pathname` and `port`
          // in webpackHotDevClient. They are used as the `sockHost`, `sockPath`
          // and `sockPort` options in webpack-dev-server.
          WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
          WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
          WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
        }
      );
    // Stringify all values so we can feed into webpack DefinePlugin
    const stringified = {
      'process.env': Object.keys(raw).reduce((env, key) => {
        env[key] = JSON.stringify(raw[key]);
        return env;
      }, {}),
    };
  
    return { raw, stringified };
}

// Common function to get style loaders.
function getStyleLoaders(cssOptions, preProcessor, environment, publicUrlOrPath, shouldUseSourceMap) {
    const isEnvProduction = environment === 'production';
    const isEnvDevelopment = !isEnvProduction;

    const loaders = [
      ...(isEnvDevelopment ? [ require.resolve('style-loader') ] : []),
      ...(true ? [ {
        loader: MiniCssExtractPlugin.loader,
        // css is located in `static/css`, use '../../' to locate index.html folder
        // in production `paths.publicUrlOrPath` can be a relative path
        options: (publicUrlOrPath.startsWith('.')
          ? { publicPath: '../../' }
          : {}),
      } ] : []),
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve('postcss-loader'),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          plugins: () => [
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
              autoprefixer: {
                flexbox: 'no-2009',
              },
              stage: 3,
            }),
            // Adds PostCSS Normalize as the reset css with default options,
            // so that it honors browserslist config in package.json
            // which in turn let's users customize the target behavior as per their needs.
            postcssNormalize(),
          ],
          sourceMap: (isEnvProduction && shouldUseSourceMap),
        },
      },
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve('resolve-url-loader'),
          options: {
            sourceMap: (isEnvProduction && shouldUseSourceMap),
          },
        },
        {
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: true,
          },
        }
      );
    }
    return loaders;
};

function getDevtoolInfo(environment, shouldUseSourceMap) {
  const isEnvProduction = environment === 'production';
  return (isEnvProduction
    ? (shouldUseSourceMap
        ? 'source-map'
        : false
    ) : 'cheap-module-source-map');
}

// Common function to get the optimization.minimizer value.
function getOptimizationMinimizer(shouldDoProfiling, shouldUseSourceMap) {
    return [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: {
              // We want terser to parse ecma 8 code. However, we don't want it
              // to apply any minification steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending further investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            // Added for profiling in devtools
            keep_classnames: shouldDoProfiling,
            keep_fnames: shouldDoProfiling,
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true,
            },
          },
          sourceMap: shouldUseSourceMap,
        }),
        // This is only used in production mode
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser,
            map: shouldUseSourceMap
              ? {
                  // `inline: false` forces the sourcemap to be output into a
                  // separate file
                  inline: false,
                  // `annotation: true` appends the sourceMappingURL to the end of
                  // the css file, helping the browser find the sourcemap
                  annotation: true,
                }
              : false,
          },
          cssProcessorPluginOptions: {
            preset: ['default', { minifyFontValues: { removeQuotes: false } }],
          },
        }),
    ];
}

// Common function to get the resolve value.
function getResolveInfo(paths, additionalModulePaths, useTypeScript, shouldDoProfiling, webpackAliases) {
  return {
    // This allows you to set a fallback for where webpack should look for modules.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebook/create-react-app/issues/253
    modules: ['node_modules', paths.appNodeModules].concat(additionalModulePaths || []),
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebook/create-react-app/issues/290
    // `web` extension prefixes have been added for better support
    // for React Native Web.
    extensions: moduleFileExtensions
      .map(ext => `.${ext}`)
      .filter(ext => useTypeScript || !ext.includes('ts')),
    alias: {
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web',
      // Allows for better profiling with ReactDevTools
      ...(shouldDoProfiling ? {
        'react-dom$': 'react-dom/profiling',
        'scheduler/tracing': 'scheduler/tracing-profiling',
      } : {}),
      ...(webpackAliases || {}),
    },
    plugins: [
      // Adds support for installing with Plug'n'Play, leading to faster installs and adding
      // guards against forgotten dependencies and such.
      PnpWebpackPlugin,
      // Prevents users from importing files from outside of src/ (or node_modules/).
      // This often causes confusion because we only process files within src/ with babel.
      // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
      // please link the files into your node_modules/ and let module-resolution kick in.
      // Make sure your source files are compiled, as they will not be processed in any way.
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
    ],
  };
}

function getResolveLoaderInfo() {
  return {
    plugins: [
      // Also related to Plug'n'Play, but this time it tells webpack to load its loaders
      // from the current package.
      PnpWebpackPlugin.moduleLoader(module),
    ],
  };
}

function getModulesOptions(paths) {
    // The body of this function has been removed
    // since we do not need to support `paths.appJsConfig`
    // since that is pretty specific to VSCode.
    return {};
}

/**
 * Get webpack aliases based on the baseUrl of a compilerOptions object.
 *
 * @param {*} options
 */
function getWebpackAliases(paths) {
    const options = getModulesOptions(paths);
    const baseUrl = options.baseUrl;
  
    if (!baseUrl) {
      return {};
    }
  
    const baseUrlResolved = path.resolve(paths.appPath, baseUrl);
  
    if (path.relative(paths.appPath, baseUrlResolved) === '') {
      return {
        src: paths.appSrc,
      };
    }
}

/**
 * Get additional module paths based on the baseUrl of a compilerOptions object.
 *
 * @param {Object} paths
 */
function getAdditionalModulePaths(paths) {
    const options = getModulesOptions(paths);
    const baseUrl = options.baseUrl;
  
    // We need to explicitly check for null and undefined (and not a falsy value) because
    // TypeScript treats an empty string as `.`.
    if (baseUrl == null) {
        // If there's no baseUrl set we respect NODE_PATH
        // Note that NODE_PATH is deprecated and will be removed
        // in the next major release of create-react-app.

        const nodePath = process.env.NODE_PATH || '';
        return nodePath.split(path.delimiter).filter(Boolean);
    }
  
    const baseUrlResolved = path.resolve(paths.appPath, baseUrl);
  
    // We don't need to do anything if `baseUrl` is set to `node_modules`. This is
    // the default behavior.
    if (path.relative(paths.appNodeModules, baseUrlResolved) === '') {
      return null;
    }
  
    // Allow the user set the `baseUrl` to `appSrc`.
    if (path.relative(paths.appSrc, baseUrlResolved) === '') {
      return [paths.appSrc];
    }
  
    // If the path is equal to the root directory we ignore it here.
    // We don't want to allow importing from the root directly as source files are
    // not transpiled outside of `src`. We do allow importing them with the
    // absolute path (e.g. `src/Components/Button.js`) but we set that up with
    // an alias.
    if (path.relative(paths.appPath, baseUrlResolved) === '') {
      return null;
    }
  
    // Otherwise, throw an error.
    throw new Error(
      chalk.red.bold("Your project's `baseUrl` can only be set to `src` or `node_modules`.")
    );
}

function getModuleInfo(paths, environment, publicUrlOrPath, shouldUseSourceMap) {
    const isEnvProduction = environment === 'production';

    return {
      strictExportPresence: true,
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },

        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          enforce: 'pre',
          use: [
            {
              options: {
                cache: true,
                formatter: require.resolve('react-dev-utils/eslintFormatter'),
                eslintPath: require.resolve('eslint'),
                resolvePluginsRelativeTo: __dirname,
                
              },
              loader: require.resolve('eslint-loader'),
            },
          ],
          include: paths.appSrc,
        },
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: imageInlineSizeLimit,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // Process application JS with Babel.
            // The preset includes JSX, Flow, TypeScript, and some ESnext features.
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: paths.appSrc,
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve(
                  'babel-preset-react-app/webpack-overrides'
                ),
                
                plugins: [
                  [
                    require.resolve('babel-plugin-named-asset-import'),
                    {
                      loaderMap: {
                        svg: {
                          ReactComponent:
                            '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                        },
                      },
                    },
                  ],
                ],
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,
                compact: isEnvProduction,
              },
            },
            // Process any JS outside of the app with Babel.
            // Unlike the application JS, we only compile the standard ES features.
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,
                
                // Babel sourcemaps are needed for debugging into node_modules
                // code.  Without the options below, debuggers like VSCode
                // show incorrect code and set breakpoints on the wrong lines.
                sourceMaps: shouldUseSourceMap,
                inputSourceMap: shouldUseSourceMap,
              },
            },
            // Process workers
            {
              test: /vitessce\.worker\.js$/,
              loader: require.resolve('worker-loader'),
              options: {
                inline: true,
                fallback: false,
              }
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use MiniCSSExtractPlugin to extract that CSS
            // to a file, but in development "style" loader enables hot editing
            // of CSS.
            // By default we support CSS Modules with the extension .module.css
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: (isEnvProduction && shouldUseSourceMap),
              }, undefined, environment, publicUrlOrPath, shouldUseSourceMap),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
            // using the extension .module.css
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: (isEnvProduction && shouldUseSourceMap),
                modules: {
                  getLocalIdent: getCSSModuleLocalIdent,
                },
              }, undefined, environment, publicUrlOrPath, shouldUseSourceMap),
            },
            // Opt-in support for SASS (using .scss or .sass extensions).
            // By default we support SASS Modules with the
            // extensions .module.scss or .module.sass
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                },
                'sass-loader', environment, publicUrlOrPath, shouldUseSourceMap
              ),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Adds support for CSS Modules, but using SASS
            // using the extension .module.scss or .module.sass
            {
              test: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: (isEnvProduction && shouldUseSourceMap),
                  modules: {
                    getLocalIdent: getCSSModuleLocalIdent,
                  },
                },
                'sass-loader', environment, publicUrlOrPath, shouldUseSourceMap
              ),
            },
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              loader: require.resolve('file-loader'),
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ],
        },
    ]
  };
}

function getNodeInfo() {
    // Some libraries import Node modules but don't use them in the browser.
    // Tell webpack to provide empty mocks for them so importing them works.
    return {
        module: 'empty',
        dgram: 'empty',
        dns: 'mock',
        fs: 'empty',
        http2: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    };
}

function getPerformanceInfo() {
    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    return false;
}

function getDevtoolModuleFilenameTemplate(paths, environment) {
  const isEnvProduction = (environment === "production");
  return (isEnvProduction
    ? info => path
        .relative(paths.appSrc, info.absoluteResourcePath)
        .replace(/\\/g, '/')
    : (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'))
  );
}

module.exports = {
    getStyleLoaders,
    getClientEnvironment,
    getAdditionalModulePaths,
    getWebpackAliases,
    getDevtoolModuleFilenameTemplate,
    getOptimizationMinimizer,
    // Functions that end in Info correspond to the top-level of the webpack config.
    getDevtoolInfo,
    getResolveInfo,
    getResolveLoaderInfo,
    getModuleInfo,
    getNodeInfo,
    getPerformanceInfo,
}